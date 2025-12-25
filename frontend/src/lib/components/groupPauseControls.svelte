<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Pause, Play } from '@lucide/svelte/icons';
	import { websocket_api } from 'schema-js';

	let { groupId, videoRef = null }: { groupId: number; videoRef?: HTMLVideoElement | null } =
		$props();

	let group = $derived(serverState.marketGroups.get(groupId));
	let isPaused = $derived(
		group?.status === websocket_api.MarketGroupStatus.MARKET_GROUP_STATUS_PAUSED
	);

	function togglePause() {
		if (!group) return;

		// Get current video timestamp if we're pausing
		let videoTimestampMs = group.videoTimestampMs ?? 0;

		if (!isPaused && videoRef) {
			// We're about to pause - capture current video time
			videoTimestampMs = Math.floor(videoRef.currentTime * 1000);
		}

		sendClientMessage({
			editMarketGroup: {
				id: groupId,
				status: isPaused
					? websocket_api.MarketGroupStatus.MARKET_GROUP_STATUS_OPEN
					: websocket_api.MarketGroupStatus.MARKET_GROUP_STATUS_PAUSED,
				videoTimestampMs
			}
		});
	}
</script>

{#if serverState.isAdmin && group}
	<Button
		variant="outline"
		size="sm"
		class={cn(
			'h-9',
			isPaused
				? 'border-amber-400 text-amber-600 hover:text-amber-600'
				: 'border-muted-foreground/30'
		)}
		onclick={togglePause}
	>
		{#if isPaused}
			<Play class="h-4 w-4" />
		{:else}
			<Pause class="h-4 w-4" />
		{/if}
		<span class="ml-2">{isPaused ? 'Resume Group' : 'Pause Group'}</span>
	</Button>
{/if}
