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
	let isMobile = $state(false);
	let hasCameraCaptureCapability = $state(false);

	// Initialize media query and check for camera capability
	$effect(() => {
		const mq = window.matchMedia('(max-width: 767px)');
		isMobile = mq.matches;

		const handler = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};

		mq.addEventListener('change', handler);

		// Check if device likely has a camera that can be accessed via 'capture'
		hasCameraCaptureCapability = navigator.maxTouchPoints > 0;

		return () => mq.removeEventListener('change', handler);
	});

	// Handle file upload
	let imageFile: FileList | null = $state(null);
	let imagePreview: string | null = $state(null);

	async function handleImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		imageFile = input.files;
		imagePreview = URL.createObjectURL(input.files[0]);
	}

	function triggerFileInput(id: string) {
		const input = document.getElementById(id) as HTMLInputElement;
		input?.click();
	}

	const form = protoSuperForm(
		'create-auction',
		websocket_api.CreateAuction.fromObject,
		async (createAuction) => {
			// If an image was selected, upload it first
			if (imageFile?.length) {
				const formData = new FormData();
				formData.append('file', imageFile[0]);

				try {
					const response = await fetch(PUBLIC_SERVER_URL+'/upload-image', {
						method: 'POST',
						body: formData
					});

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

			sendClientMessage({ createAuction });
			open = false;

			// Cleanup
			if (imagePreview) {
				URL.revokeObjectURL(imagePreview);
				imagePreview = null;
			}
			imageFile = null;
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
						<Input {...props} bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Input {...props} bind:value={$formData.description} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="image">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Image</Form.Label>
						{#if isMobile}
							<div class="flex flex-col gap-2">
								{#if hasCameraCaptureCapability}
									<!-- Hidden camera input -->
									<input
										type="file"
										accept="image/*"
										capture
										id="take-picture"
										class="hidden"
										on:change={handleImageUpload}
									/>
									<!-- Camera button -->
									<button
										type="button"
										class={buttonVariants({ variant: 'outline' })}
										on:click={() => triggerFileInput('take-picture')}
									>
										Take Picture
									</button>
								{/if}
								<!-- Hidden file input -->
								<input
									type="file"
									accept="image/*"
									id="choose-file"
									class="hidden"
									on:change={handleImageUpload}
								/>
								<!-- Choose file button -->
								<button
									type="button"
									class={buttonVariants({ variant: 'outline' })}
									on:click={() => triggerFileInput('choose-file')}
								>
									Choose File
								</button>
							</div>
						{:else}
							<div class="flex flex-col gap-2">
								<!-- Hidden file input -->
								<input
									type="file"
									accept="image/*"
									id="choose-file-desktop"
									class="hidden"
									on:change={handleImageUpload}
								/>
								<!-- Visible button -->
								<button
									type="button"
									class={buttonVariants({ variant: 'outline' })}
									on:click={() => triggerFileInput('choose-file-desktop')}
								>
									Choose File
								</button>
							</div>
						{/if}
					{/snippet}
				</Form.Control>
				{#if imagePreview}
					<img src={imagePreview} alt="Preview" class="mt-2 max-h-48 rounded object-contain" />
				{/if}
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button>Submit</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
