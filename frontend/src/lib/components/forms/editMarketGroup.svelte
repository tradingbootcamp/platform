<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Pencil } from '@lucide/svelte/icons';
	import VideoPicker from './videoPicker.svelte';

	let { groupId }: { groupId: number } = $props();

	let group = $derived(serverState.marketGroups.get(groupId));
	let open = $state(false);
	let videoUrl = $state('');

	// Sync videoUrl with group data when dialog opens
	$effect(() => {
		if (open && group) {
			videoUrl = group.videoUrl ?? '';
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		sendClientMessage({
			editMarketGroup: {
				id: groupId,
				videoUrl: videoUrl || undefined,
				status: group?.status ?? 0,
				videoTimestampMs: group?.videoTimestampMs ?? 0
			}
		});
		open = false;
	}
</script>

{#if serverState.isAdmin && group}
	<Dialog.Root bind:open>
		<Dialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8' })}>
			<Pencil class="h-4 w-4" />
			<span class="sr-only">Edit Group</span>
		</Dialog.Trigger>
		<Dialog.Content>
			<form onsubmit={handleSubmit}>
				<Dialog.Header>
					<Dialog.Title>Edit Group: {group.name}</Dialog.Title>
				</Dialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="videoUrl">Video URL</Label>
						<VideoPicker bind:value={videoUrl} />
						<p class="text-sm text-muted-foreground">
							Select from library or paste URL. Leave empty to remove video.
						</p>
					</div>
				</div>
				<Dialog.Footer>
					<Button type="submit">Save Changes</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/if}
