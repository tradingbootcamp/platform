<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Film, Upload, Check, X } from '@lucide/svelte/icons';

	let {
		value = $bindable(''),
		onSelect
	}: {
		value?: string;
		onSelect?: (url: string) => void;
	} = $props();

	let open = $state(false);
	let uploading = $state(false);
	let uploadProgress = $state('');
	let fileInput: HTMLInputElement;

	// State for pending upload (file selected, waiting for name)
	let pendingFile: File | null = $state(null);
	let videoName = $state('');

	// Fetch videos when dialog opens
	$effect(() => {
		if (open) {
			sendClientMessage({ getVideos: {} });
		}
	});

	function formatFileSize(bytes: number | { toNumber(): number } | null | undefined): string {
		if (!bytes) return '0 B';
		const b = typeof bytes === 'number' ? bytes : bytes.toNumber();
		if (b < 1024) return `${b} B`;
		if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
		return `${(b / (1024 * 1024)).toFixed(1)} MB`;
	}

	function formatDate(timestamp: { seconds?: number | { toNumber(): number } | null } | null | undefined): string {
		if (!timestamp?.seconds) return '';
		const seconds = typeof timestamp.seconds === 'number' ? timestamp.seconds : timestamp.seconds.toNumber();
		return new Date(seconds * 1000).toLocaleDateString();
	}

	function selectVideo(filename: string) {
		// Use relative URL - works with Vite proxy in dev and directly in prod
		const url = `/api/videos/${filename}`;
		value = url;
		onSelect?.(url);
		open = false;
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		pendingFile = file;
		// Default the name to the filename without extension
		const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
		videoName = nameWithoutExt;
	}

	function cancelUpload() {
		pendingFile = null;
		videoName = '';
		if (fileInput) fileInput.value = '';
	}

	async function confirmUpload() {
		if (!pendingFile || !videoName.trim()) return;

		uploading = true;
		uploadProgress = 'Uploading...';

		try {
			const formData = new FormData();
			// Put small fields first, file last (helps with multipart parsing)
			formData.append('user_id', String(serverState.userId));
			formData.append('name', videoName.trim());
			formData.append('file', pendingFile);

			console.log('Uploading file, size:', pendingFile.size);

			const response = await fetch('/api/upload-video', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const text = await response.text();
				console.error('Upload failed:', response.status, text);
				throw new Error(`Upload failed (${response.status}): ${text || 'Unknown error'}`);
			}

			const result = await response.json() as { filename: string };

			uploadProgress = 'Upload complete!';

			// Reset state
			pendingFile = null;
			videoName = '';
			if (fileInput) fileInput.value = '';

			// Refresh video list
			sendClientMessage({ getVideos: {} });

			// Auto-select the uploaded video
			setTimeout(() => {
				selectVideo(result.filename);
			}, 500);
		} catch (error) {
			uploadProgress = `Upload failed: ${error}`;
		} finally {
			uploading = false;
		}
	}

	// Extract filename from URL for display
	function getFilenameFromUrl(url: string): string {
		if (!url) return '';
		const parts = url.split('/');
		return parts[parts.length - 1] || url;
	}

	let selectedFilename = $derived(getFilenameFromUrl(value));
</script>

<div class="flex gap-2">
	<Input
		type="text"
		bind:value
		placeholder="Select from library or paste URL"
		class="flex-1"
	/>
	<Dialog.Root bind:open>
		<Dialog.Trigger type="button" class={buttonVariants({ variant: 'outline' })}>
			<Film class="mr-2 h-4 w-4" />
			Library
		</Dialog.Trigger>
		<Dialog.Content class="max-w-2xl">
			<Dialog.Header>
				<Dialog.Title>Video Library</Dialog.Title>
				<Dialog.Description>
					Select a video from the library or upload a new one.
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4">
				<!-- Upload section -->
				{#if pendingFile}
					<!-- Name input for pending upload -->
					<div class="rounded-lg border p-4 space-y-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 text-sm">
								<Film class="h-4 w-4" />
								<span class="font-medium">{pendingFile.name}</span>
								<span class="text-muted-foreground">({formatFileSize(pendingFile.size)})</span>
							</div>
							<button type="button" onclick={cancelUpload} class="text-muted-foreground hover:text-foreground">
								<X class="h-4 w-4" />
							</button>
						</div>
						<div class="space-y-2">
							<Label for="video-name">Video Name</Label>
							<Input
								id="video-name"
								bind:value={videoName}
								placeholder="Enter a name for this video..."
								disabled={uploading}
							/>
						</div>
						<div class="flex justify-end gap-2">
							<Button type="button" variant="outline" onclick={cancelUpload} disabled={uploading}>
								Cancel
							</Button>
							<Button type="button" onclick={confirmUpload} disabled={uploading || !videoName.trim()}>
								{uploading ? uploadProgress : 'Upload'}
							</Button>
						</div>
					</div>
				{:else}
					<!-- File picker -->
					<div class="rounded-lg border border-dashed p-4">
						<Label for="video-upload" class="cursor-pointer">
							<div class="flex items-center justify-center gap-2 text-muted-foreground">
								<Upload class="h-5 w-5" />
								<span>Click to select a video file</span>
							</div>
						</Label>
						<input
							id="video-upload"
							type="file"
							accept="video/*"
							class="hidden"
							bind:this={fileInput}
							onchange={handleFileSelect}
						/>
					</div>
				{/if}

				<!-- Video list -->
				<div class="max-h-[300px] overflow-y-auto">
					{#if serverState.videos.length === 0}
						<p class="py-8 text-center text-muted-foreground">
							No videos uploaded yet. Upload your first video above.
						</p>
					{:else}
						<div class="space-y-1">
							{#each serverState.videos as video (video.id)}
								{@const isSelected = selectedFilename === video.filename}
								{@const displayName = video.name || video.originalName}
								<button
									type="button"
									class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted {isSelected ? 'bg-muted' : ''}"
									onclick={() => selectVideo(video.filename ?? '')}
								>
									<div class="flex items-center gap-3">
										<Film class="h-4 w-4 text-muted-foreground" />
										<div>
											<p class="font-medium">{displayName}</p>
											<p class="text-xs text-muted-foreground">
												{formatFileSize(video.sizeBytes)} &middot; {formatDate(video.uploadedAt)}
											</p>
										</div>
									</div>
									{#if isSelected}
										<Check class="h-4 w-4 text-primary" />
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
