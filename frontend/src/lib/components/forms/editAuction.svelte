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

	interface Props {
		auction: websocket_api.IAuction;
		close: () => void;
	}

	let { auction, close }: Props = $props();

	// Parse existing description to separate main content from contact info
	let { initialMainDescription, initialContactInfo } = $derived.by(() => {
		const description = auction.description || '';
		const contactMatch = description.match(/^(.*?)\n\n(Contact:|Pickup:)(.*)$/s);

		if (contactMatch) {
			return {
				initialMainDescription: contactMatch[1].trim(),
				initialContactInfo: `${contactMatch[3].trim()}`
			};
		}

		return {
			initialMainDescription: description,
			initialContactInfo: ''
		};
	});

	let open = $state(false);
	let isSubmitting = $state(false);

	// Contact info state
	let contactInfo = $state('');

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
			let stream: MediaStream;
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: { ideal: 'environment' } }
				});
			} catch {
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
				cameraError =
					'Camera permission denied. Please allow camera access in your browser settings.';
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
		const processed = original.size > 2 * 1024 * 1024 ? await shrinkImage(original) : original;

		imageFile = [processed] as unknown as FileList;
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
		quality = 0.85
	): Promise<File> {
		return new Promise((res, rej) => {
			const img = new Image();
			img.onload = () => {
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

	// Extract filename from imageUrl (e.g., "/images/abc.jpg" -> "abc.jpg")
	function getFilenameFromUrl(url: string | null | undefined): string {
		if (!url || url === '/images/') return '';
		return url.replace('/images/', '');
	}

	const initialData = websocket_api.EditAuction.create({
		id: auction.id ?? 0,
		name: auction.name ?? '',
		description: '',
		imageFilename: getFilenameFromUrl(auction.imageUrl),
		binPrice: auction.binPrice ?? undefined,
		confirmAdmin: false
	});

	const form = protoSuperForm(
		'edit-auction',
		(data: websocket_api.IEditAuction) => {
			// Validate name is not empty
			if (!data.name || data.name.trim() === '') {
				throw new Error('Name is required');
			}

			// Validate name is not duplicate (excluding current auction)
			const existingAuctions = Array.from(serverState.auctions.values());
			const isDuplicate = existingAuctions.some(
				(a) => a.id !== auction.id && a.name?.toLowerCase() === data.name!.trim().toLowerCase()
			);
			if (isDuplicate) {
				throw new Error('A listing with this name already exists');
			}

			// Concatenate contact info to description if present
			let finalDescription = (data.description || '') as string;

			// Remove any existing contact info to prevent duplication
			finalDescription = finalDescription
				.replace(/\n\nContact:.*$/s, '')
				.replace(/\n\nPickup:.*$/s, '');

			if (contactInfo.trim()) {
				finalDescription += `\n\nContact: ${contactInfo.trim()}`;
			}

			return websocket_api.EditAuction.fromObject({
				...data,
				description: finalDescription
			});
		},
		async (editAuction) => {
			isSubmitting = true;

			try {
				// If a new image was selected, upload it first
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
						editAuction.imageFilename = filename;
					} catch (error) {
						console.error('Error uploading image:', error);
						return;
					}
				}

				sendClientMessage({ editAuction });
				open = false;

				// Wait for dialog to close before closing parent modal
				await new Promise((resolve) => setTimeout(resolve, 100));
				close();

				// Cleanup
				if (imagePreview) {
					URL.revokeObjectURL(imagePreview);
					imagePreview = null;
				}
				imageFile = null;
			} catch (error) {
				console.error('Error editing listing:', error);
			} finally {
				isSubmitting = false;
			}
		},
		initialData,
		{
			resetForm: false
		}
	);

	const { form: formData, enhance } = form;

	// Reset form data when dialog opens
	$effect(() => {
		if (open) {
			$formData.name = auction.name ?? '';
			$formData.description = initialMainDescription;
			$formData.binPrice = auction.binPrice ?? undefined;
			$formData.imageFilename = getFilenameFromUrl(auction.imageUrl);
			contactInfo = initialContactInfo;
			imagePreview = null;
			imageFile = null;
		}
	});

	// Cleanup on dialog close
	$effect(() => {
		if (!open && imagePreview) {
			URL.revokeObjectURL(imagePreview);
			imagePreview = null;
			imageFile = null;
		}
		if (!open) {
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
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', className: 'w-full' })}
		>Edit Listing</Dialog.Trigger
	>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<form use:enhance>
			<Dialog.Header>
				<Dialog.Title>Edit Listing</Dialog.Title>
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
							placeholder="Enter your contact information (email, phone, etc.)"
							rows={3}
						/>
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
					{#snippet children()}
						<Form.Label>New Image (optional)</Form.Label>
						<div class="flex flex-col gap-2">
							{#if showCamera}
								<div class="relative">
									<!-- svelte-ignore a11y_media_has_caption -->
									<video bind:this={videoElement} autoplay playsinline class="w-full rounded border"
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
									<input
										type="file"
										accept="image/*"
										capture
										id="edit-take-picture-mobile"
										class="hidden"
										onchange={handleImageUpload}
										disabled={isSubmitting}
									/>
									<button
										type="button"
										class={buttonVariants({ variant: 'outline' })}
										onclick={() => triggerFileInput('edit-take-picture-mobile')}
										disabled={isSubmitting}
									>
										Take New Picture
									</button>
								{:else}
									<button
										type="button"
										class={buttonVariants({ variant: 'outline' })}
										onclick={startCamera}
										disabled={isSubmitting}
									>
										Take New Picture
									</button>
								{/if}
								<input
									type="file"
									accept="image/*"
									id="edit-choose-file"
									class="hidden"
									onchange={handleImageUpload}
									disabled={isSubmitting}
								/>
								<button
									type="button"
									class={buttonVariants({ variant: 'outline' })}
									onclick={() => triggerFileInput('edit-choose-file')}
									disabled={isSubmitting}
								>
									Choose New File
								</button>
							{/if}
							{#if cameraError}
								<p class="text-sm text-red-500">{cameraError}</p>
							{/if}
						</div>
					{/snippet}
				</Form.Control>
				{#if imagePreview && !showCamera}
					<p class="mt-2 text-sm text-muted-foreground">New image:</p>
					<img
						src={imagePreview}
						alt="New upload preview"
						class="mt-1 max-h-48 rounded object-contain"
					/>
				{:else if auction.imageUrl && auction.imageUrl !== '/images/'}
					<p class="mt-2 text-sm text-muted-foreground">Current image:</p>
					<img
						src={PUBLIC_SERVER_URL.replace('wss', 'https').replace('ws', 'http') + auction.imageUrl}
						alt="Current auction item"
						class="mt-1 max-h-48 rounded object-contain"
					/>
				{/if}
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Changes'}
				</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
