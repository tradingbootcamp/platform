<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { websocket_api } from 'schema-js';

	let { groupId }: { groupId: number } = $props();

	let videoElement = $state<HTMLVideoElement | null>(null);

	let group = $derived(serverState.marketGroups.get(groupId));
	let videoUrl = $derived(group?.videoUrl);
	let isPlaying = $derived(group?.status === websocket_api.MarketGroupStatus.MARKET_GROUP_STATUS_OPEN);
	let videoTimestampMs = $derived(group?.videoTimestampMs ?? 0);
	let pausedAt = $derived(group?.pausedAt);

	// Calculate current playback position
	function getCurrentTimeSeconds(): number {
		if (!pausedAt) return videoTimestampMs / 1000;

		const pausedAtMs =
			(pausedAt.seconds?.toNumber?.() ?? Number(pausedAt.seconds ?? 0)) * 1000 +
			(pausedAt.nanos ?? 0) / 1_000_000;

		if (isPlaying) {
			// Video is playing: current position = saved timestamp + elapsed time since pause ended
			const elapsedMs = Date.now() - pausedAtMs;
			return (videoTimestampMs + elapsedMs) / 1000;
		} else {
			// Video is paused: show at saved timestamp
			return videoTimestampMs / 1000;
		}
	}

	// Sync video element with calculated time
	$effect(() => {
		if (videoElement && videoUrl) {
			const targetTime = getCurrentTimeSeconds();
			const currentTime = videoElement.currentTime;

			// Only seek if significantly out of sync (> 0.5 second)
			if (Math.abs(currentTime - targetTime) > 0.5) {
				videoElement.currentTime = targetTime;
			}

			if (isPlaying && videoElement.paused) {
				videoElement.play().catch(() => {});
			} else if (!isPlaying && !videoElement.paused) {
				videoElement.pause();
			}
		}
	});

	// Periodic sync while playing
	let syncInterval: ReturnType<typeof setInterval> | undefined;
	$effect(() => {
		if (isPlaying && videoElement) {
			syncInterval = setInterval(() => {
				if (videoElement) {
					const targetTime = getCurrentTimeSeconds();
					if (Math.abs(videoElement.currentTime - targetTime) > 1) {
						videoElement.currentTime = targetTime;
					}
				}
			}, 5000);
		}
		return () => {
			if (syncInterval) clearInterval(syncInterval);
		};
	});
</script>

{#if videoUrl}
	<div class="w-full aspect-video bg-black rounded-lg overflow-hidden">
		<video
			bind:this={videoElement}
			src={videoUrl}
			class="w-full h-full"
			muted
			playsinline
		>
			<track kind="captions" />
		</video>
	</div>
{/if}
