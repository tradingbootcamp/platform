<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { Checkbox } from '$lib/components/ui/checkbox';

	const initialData = websocket_api.CreateAuction.create({
		name: '',
		description: '',
		imageFilename: '',
		binPrice: 0
	});
	let open = $state(false);
	let isSubmitting = $state(false);

	// Contact method state
	let contactMethod = $state('contact'); // 'contact' or 'booth'
	let contactInfo = $state('');
	let lotNumber = $state('');

	// Legal affirmation state
	let legalAffirmation = $state(false);

	// Handle file upload
	let imageFile: FileList | null = $state(null);
	let imagePreview: string | null = $state(null);
	const MAX_IMAGE_DIM = 1000;

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

	function roundToWhole(value: number | string) {
		if (value === '' || value === null || value === undefined) return value;
		const numeric = typeof value === 'number' ? value : Number(value);
		if (!Number.isFinite(numeric)) return value;
		return Math.round(numeric);
	}
	const form = protoSuperForm(
		'create-auction',
		(data) => {
			// Validate name is not empty
			if (!data.name || data.name.trim() === '') {
				throw new Error('Name is required');
			}

			// Validate bin price is required and positive
			if (!data.binPrice || data.binPrice <= 0) {
				throw new Error('Buy It Now price is required and must be greater than 0');
			}

			// Validate legal affirmation
			if (!legalAffirmation) {
				throw new Error('You must confirm that this item is legal to sell');
			}

			// Check if non-admin user already has an auction
			if (!serverState.isAdmin) {
				const existingAuctions = Array.from(serverState.auctions.values());
				const userHasActiveAuction = existingAuctions.some(
					(auction) => auction.ownerId === serverState.userId && auction.status === 'open'
				);
				if (userHasActiveAuction) {
					throw new Error('You can only have one active listing at a time');
				}
			}

			// Validate contact information
			if (contactMethod === 'contact') {
				if (!contactInfo.trim()) {
					throw new Error('Contact information is required');
				}
			} else if (contactMethod === 'booth') {
				if (!lotNumber.trim()) {
					throw new Error('Lot number is required');
				}
			}

			// Validate name is not duplicate
			const existingAuctions = Array.from(serverState.auctions.values());
			const isDuplicate = existingAuctions.some(
				(auction) => auction.name?.toLowerCase() === data.name.trim().toLowerCase()
			);
			if (isDuplicate) {
				throw new Error('A listing with this name already exists');
			}

			// Concatenate contact info or lot number to description
			let finalDescription = data.description || '';

			// Remove any existing contact info to prevent duplication
			finalDescription = finalDescription
				.replace(/\n\nContact:.*$/s, '')
				.replace(/\n\nPickup:.*$/s, '');

			if (contactMethod === 'contact') {
				finalDescription += `\n\nContact: ${contactInfo.trim()}`;
			} else if (contactMethod === 'booth') {
				finalDescription += `\n\nPickup: Trading Bootcamp booth in Rat Park - Lot #${lotNumber.trim()}`;
			}

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

	// Cleanup on dialog close
	$effect(() => {
		if (!open && imagePreview) {
			URL.revokeObjectURL(imagePreview);
			imagePreview = null;
			imageFile = null;
		}
		// Reset contact fields when dialog closes
		if (!open) {
			contactMethod = 'contact';
			contactInfo = '';
			lotNumber = '';
			legalAffirmation = false;
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

			<!-- Contact Method Toggle -->
			<div class="space-y-2">
				<label class="text-sm font-medium">Delivery Method</label>
				<ToggleGroup.Root type="single" bind:value={contactMethod} class="grid grid-cols-2">
					<ToggleGroup.Item
						value="contact"
						variant="outline"
						class="border-2 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
					>
						Provide Contact Info
					</ToggleGroup.Item>
					<ToggleGroup.Item
						value="booth"
						variant="outline"
						class="border-2 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
					>
						Night Market Booth
					</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>

			<!-- Contact Information Field -->
			{#if contactMethod === 'contact'}
				<Form.Field {form} name="contact">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Contact Information</Form.Label>
							<Textarea
								{...props}
								bind:value={contactInfo}
								disabled={isSubmitting}
								placeholder="Enter your contact information (email, phone, etc.). This information will be given to the seller, but we cannot guarantee that this information will not be leaked."
								rows={2}
								required
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{:else if contactMethod === 'booth'}
				<Form.Field {form} name="lotNumber">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Lot Number</Form.Label>
							<Input
								{...props}
								bind:value={lotNumber}
								disabled={isSubmitting}
								placeholder="Enter the lot number you were told by the Trading Bootcamp staff"
								required
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
					<Form.Description>
						Drop off your item at the Trading Bootcamp booth in Rat Park to get a lot number. Items
						left after 10:15 will be considered abandoned, and will be claimed, given away, or
						thrown out.
					</Form.Description>and
				</Form.Field>
			{/if}

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
								<br />• any smartass loopholes in the foregoing prohibitions
							</Form.Label>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

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
							placeholder="Enter the buy-it-now price"
							required
							on:blur={() => {
								$formData.binPrice = roundToWhole($formData.binPrice);
							}}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="image">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Image</Form.Label>
						<div class="flex flex-col gap-2">
							<!-- Hidden camera input -->
							<input
								type="file"
								accept="image/*"
								capture
								id="take-picture"
								class="hidden"
								on:change={handleImageUpload}
								disabled={isSubmitting}
							/>
							<!-- Camera button -->
							<button
								type="button"
								class={buttonVariants({ variant: 'outline' })}
								on:click={() => triggerFileInput('take-picture')}
								disabled={isSubmitting}
							>
								Take Picture
							</button>
							<!-- Hidden file input -->
							<input
								type="file"
								accept="image/*"
								id="choose-file"
								class="hidden"
								on:change={handleImageUpload}
								disabled={isSubmitting}
							/>
							<!-- Choose file button -->
							<button
								type="button"
								class={buttonVariants({ variant: 'outline' })}
								on:click={() => triggerFileInput('choose-file')}
								disabled={isSubmitting}
							>
								Choose File
							</button>
						</div>
					{/snippet}
				</Form.Control>
				{#if imagePreview}
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
