<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { roundToWhole } from '$lib/components/marketDataUtils';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';

	const initialData = websocket_api.CreateAuction.create({
		name: '',
		description: '',
		imageFilename: ''
	});
	let open = $state(false);
	let isSubmitting = $state(false);

	// Contact info state
	let contactInfo = $state('');

	// Legal affirmation state
	let legalAffirmation = $state(false);

	// Handle file upload
	let imageFile: FileList | null = $state(null);
	let imagePreview: string | null = $state(null);
	const MAX_IMAGE_DIM = 1000;

	// Camera state
	let showCamera = $state(false);
	let videoElement: HTMLVideoElement | null = $state(null);
	let cameraStream: MediaStream | null = $state(null);
	let cameraError: string | null = $state(null);

	// Detect mobile devices - use native capture there, WebRTC on desktop
	const isMobile =
		typeof navigator !== 'undefined' &&
		/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

	async function startCamera() {
		cameraError = null;
		showCamera = true;

		try {
			// First try with back camera preference, fall back to any camera
			let stream: MediaStream;
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: { ideal: 'environment' } } // prefer back camera, but don't require it
				});
			} catch {
				// Fall back to any available camera
				stream = await navigator.mediaDevices.getUserMedia({ video: true });
			}
			cameraStream = stream;
			if (videoElement) {
				videoElement.srcObject = stream;
			}
		} catch (err) {
			console.error('Camera access error:', err);
			const error = err as Error;
			if (error.name === 'NotAllowedError') {
				cameraError = 'Camera permission denied. Please allow camera access in your browser settings.';
			} else if (error.name === 'NotFoundError') {
				cameraError = 'No camera found on this device.';
			} else if (error.name === 'NotReadableError') {
				cameraError = 'Camera is in use by another application.';
			} else {
				cameraError = `Could not access camera: ${error.message || error.name || 'Unknown error'}`;
			}
			showCamera = false;
		}
	}

	function stopCamera() {
		if (cameraStream) {
			cameraStream.getTracks().forEach((track) => track.stop());
			cameraStream = null;
		}
		showCamera = false;
		cameraError = null;
	}

	async function capturePhoto() {
		if (!videoElement || !cameraStream) return;

		const canvas = document.createElement('canvas');
		canvas.width = videoElement.videoWidth;
		canvas.height = videoElement.videoHeight;
		canvas.getContext('2d')!.drawImage(videoElement, 0, 0);

		// Convert to blob
		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', 0.85)
		);

		if (blob) {
			const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
			const processed = file.size > 2 * 1024 * 1024 ? await shrinkImage(file) : file;
			imageFile = [processed] as unknown as FileList;
			if (imagePreview) {
				URL.revokeObjectURL(imagePreview);
			}
			imagePreview = URL.createObjectURL(processed);
		}

		stopCamera();
	}

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		const original = input.files[0];

		// skip tiny images
		const processed = original.size > 2 * 1024 * 1024 ? await shrinkImage(original) : original;

		imageFile = [processed] as unknown as FileList; // keep API unchanged
		imagePreview = URL.createObjectURL(processed);
	}

	function triggerFileInput(id: string) {
		const input = document.getElementById(id) as HTMLInputElement;
		input?.click();
	}

	function shrinkImage(
		file: File,
		maxW = MAX_IMAGE_DIM,
		maxH = MAX_IMAGE_DIM,
		quality = 0.85 // 0-1 for JPEG
	): Promise<File> {
		return new Promise((res, rej) => {
			const img = new Image();
			img.onload = () => {
				// keep aspect ratio
				let { width, height } = img;
				const scale = Math.min(1, maxW / width, maxH / height);
				width = width * scale;
				height = height * scale;

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) =>
						blob
							? res(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: blob.type }))
							: rej(new Error('toBlob() failed')),
					'image/jpeg',
					quality
				);
			};
			img.onerror = rej;
			img.src = URL.createObjectURL(file);
		});
	}

	const form = protoSuperForm(
		'create-auction',
		(data: websocket_api.ICreateAuction) => {
			// Validate name is not empty
			if (!data.name || data.name.trim() === '') {
				throw new Error('Name is required');
			}

			// Validate legal affirmation
			if (!legalAffirmation) {
				throw new Error('You must confirm that this item is legal to sell');
			}

			// Validate contact information
			if (!contactInfo.trim()) {
				throw new Error('Contact information is required');
			}

			// Validate name is not duplicate
			const existingAuctions = Array.from(serverState.auctions.values());
			const isDuplicate = existingAuctions.some(
				(auction) => auction.name?.toLowerCase() === data.name!.trim().toLowerCase()
			);
			if (isDuplicate) {
				throw new Error('A listing with this name already exists');
			}

			// Concatenate contact info to description
			let finalDescription = (data.description || '') as string;

			// Remove any existing contact info to prevent duplication
			finalDescription = finalDescription
				.replace(/\n\nContact:.*$/s, '')
				.replace(/\n\nPickup:.*$/s, '');

			finalDescription += `\n\nContact: ${contactInfo.trim()}`;

			return websocket_api.CreateAuction.fromObject({
				...data,
				description: finalDescription
			});
		},
		async (createAuction) => {
			isSubmitting = true;

			try {
				// If an image was selected, upload it first
				if (imageFile?.length) {
					const formData = new FormData();
					formData.append('file', imageFile[0]);

					try {
						const response = await fetch(
							PUBLIC_SERVER_URL.replace('wss', 'https').replace('ws', 'http') + '/upload-image',
							{
								method: 'POST',
								body: formData
							}
						);

						if (!response.ok) {
							throw new Error('Failed to upload image');
						}

						const { filename } = await response.json();
						createAuction.imageFilename = filename;
					} catch (error) {
						console.error('Error uploading image:', error);
						return;
					}
				}

				// Use proper WebSocket API instead of REST
				sendClientMessage({ createAuction });

				// Only close modal after successful submission
				open = false;

				// Reset form fields
				$formData.name = '';
				$formData.description = '';
				$formData.binPrice = undefined;
				contactInfo = '';
				legalAffirmation = false;

				// Cleanup
				if (imagePreview) {
					URL.revokeObjectURL(imagePreview);
					imagePreview = null;
				}
				imageFile = null;
			} catch (error) {
				console.error('Error creating listing:', error);
			} finally {
				isSubmitting = false;
			}
		},
		initialData,
		{
			resetForm: false // Don't reset form on validation errors so user can see and fix them
		}
	);

	const { form: formData, enhance } = form;

	// Cleanup on dialog close (but preserve form data)
	$effect(() => {
		if (!open) {
			// Stop camera if it's running
			stopCamera();
		}
	});

	// Set video srcObject when videoElement becomes available
	$effect(() => {
		if (videoElement && cameraStream) {
			videoElement.srcObject = cameraStream;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', className: 'text-base' })}
		>List Item</Dialog.Trigger
	>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<form use:enhance>
			<Dialog.Header>
				<Dialog.Title>List Item</Dialog.Title>
			</Dialog.Header>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$formData.name} disabled={isSubmitting} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Textarea
							{...props}
							bind:value={$formData.description}
							disabled={isSubmitting}
							rows={3}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Contact Information Field -->
			<Form.Field {form} name="contact">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Contact Information</Form.Label>
						<Textarea
							{...props}
							bind:value={contactInfo}
							disabled={isSubmitting}
							placeholder="Enter your contact information (email, phone, etc.). This information will be given to the buyer, but we cannot guarantee that this information will not be leaked."
							rows={5}
							required
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Legal Affirmation Checkbox -->
			<Form.Field {form} name="legalAffirmation">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex items-start space-x-2">
							<Checkbox
								{...props}
								bind:checked={legalAffirmation}
								disabled={isSubmitting}
								required
								class="mt-1"
							/>
							<Form.Label class="cursor-pointer text-sm font-normal leading-relaxed">
								My listing does not include:
								<br />• legal tender or regulated financial products
								<br />• illegal goods or services
								<br />• a violation of the Onion Futures Act
								<br />• anything else that is going to get the exchange operators in trouble
								<br />• violation of another person's consent
								<br />• harm or anticipated harm to others or myself
								<br />• the participation of any person under the age of 18
								<br />• items offered in bad faith or bad taste
								<br />• any smartass loopholes in the foregoing prohibitions or this one
							</Form.Label>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			{#if serverState.isAdmin}
				<Form.Field {form} name="binPrice">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Buy It Now Price</Form.Label>
							<Input
								{...props}
								type="number"
								step="1"
								min="1"
								bind:value={$formData.binPrice}
								disabled={isSubmitting}
								placeholder="Enter the buy-it-now price (optional)"
								onblur={() => {
									$formData.binPrice = roundToWhole($formData.binPrice as unknown as number);
								}}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
			<Form.Field {form} name="image">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Image</Form.Label>
						<div class="flex flex-col gap-2">
							{#if showCamera}
								<!-- Live camera preview (desktop only) -->
								<div class="relative">
									<video
										bind:this={videoElement}
										autoplay
										playsinline
										class="w-full rounded border"
									></video>
									<div class="mt-2 grid grid-cols-2 gap-2">
										<button
											type="button"
											class={buttonVariants({ variant: 'default' })}
											onclick={capturePhoto}
										>
											Capture
										</button>
										<button
											type="button"
											class={buttonVariants({ variant: 'outline' })}
											onclick={stopCamera}
										>
											Cancel
										</button>
									</div>
								</div>
							{:else}
								{#if isMobile}
									<!-- Native camera capture for mobile -->
									<input
										type="file"
										accept="image/*"
										capture
										id="take-picture-mobile"
										class="hidden"
										onchange={handleImageUpload}
										disabled={isSubmitting}
									/>
									<button
										type="button"
										class={buttonVariants({ variant: 'outline' })}
										onclick={() => triggerFileInput('take-picture-mobile')}
										disabled={isSubmitting}
									>
										Take Picture
									</button>
								{:else}
									<!-- WebRTC camera for desktop -->
									<button
										type="button"
										class={buttonVariants({ variant: 'outline' })}
										onclick={startCamera}
										disabled={isSubmitting}
									>
										Take Picture
									</button>
								{/if}
								<!-- Hidden file input for choosing existing files -->
								<input
									type="file"
									accept="image/*"
									id="choose-file"
									class="hidden"
									onchange={handleImageUpload}
									disabled={isSubmitting}
								/>
								<button
									type="button"
									class={buttonVariants({ variant: 'outline' })}
									onclick={() => triggerFileInput('choose-file')}
									disabled={isSubmitting}
								>
									Choose File
								</button>
							{/if}
							{#if cameraError}
								<p class="text-sm text-red-500">{cameraError}</p>
							{/if}
						</div>
					{/snippet}
				</Form.Control>
				{#if imagePreview && !showCamera}
					<img src={imagePreview} alt="Preview" class="mt-2 max-h-48 rounded object-contain" />
				{/if}
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button disabled={isSubmitting}>
					{isSubmitting ? 'Creating...' : 'Submit'}
				</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
