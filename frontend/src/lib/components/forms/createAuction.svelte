<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import { PUBLIC_SERVER_URL } from '$env/static/public';

	const initialData = websocket_api.CreateAuction.create({
		name: '',
		description: '',
		imageFilename: ''
	});
	let open = $state(false);
	let isSubmitting = $state(false);

	// Handle file upload
	let imageFile: FileList | null = $state(null);
	let imagePreview: string | null = $state(null);
	const MAX_IMAGE_DIM = 1000;

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		const original = input.files[0];

		// skip tiny images
		const processed =
			original.size > 2 * 1024 * 1024 ? await shrinkImage(original) : original;

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
		websocket_api.CreateAuction.fromObject,
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
				console.error('Error creating auction:', error);
			} finally {
				isSubmitting = false;
			}
		},
		initialData
	);

	const { form: formData, enhance } = form;

	// Cleanup on dialog close
	$effect(() => {
		if (!open && imagePreview) {
			URL.revokeObjectURL(imagePreview);
			imagePreview = null;
			imageFile = null;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', className: 'text-base' })}
		>Create Auction</Dialog.Trigger
	>
	<Dialog.Content>
		<form use:enhance>
			<Dialog.Header>
				<Dialog.Title>Create Auction</Dialog.Title>
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
						<Input {...props} bind:value={$formData.description} disabled={isSubmitting} />
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
