<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { websocket_api } from 'schema-js';

	let {
		groupId,
		videoRef = $bindable<HTMLVideoElement | null>(null)
	}: {
		groupId: number;
		videoRef?: HTMLVideoElement | null;
	} = $props();

	let group = $derived(serverState.marketGroups.get(groupId));
	let videoUrl = $derived(group?.videoUrl);
	let isPlaying = $derived(group?.status === websocket_api.MarketGroupStatus.MARKET_GROUP_STATUS_OPEN);
	let videoTimestampMs = $derived(group?.videoTimestampMs ?? 0);
	let pausedAt = $derived(group?.pausedAt);

	// Track state for sync logic
	let prevIsPlaying: boolean | undefined;
	let prevVideoTimestampMs: number | undefined;
	let videoReady = $state(false);

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

	// Sync to correct position when video becomes ready
	function handleLoadedMetadata() {
		videoReady = true;
		syncToCorrectPosition();
	}

	function syncToCorrectPosition() {
		if (!videoRef || !videoReady) return;

		const targetTime = getCurrentTimeSeconds();
		if (Math.abs(videoRef.currentTime - targetTime) > 0.5) {
			videoRef.currentTime = targetTime;
		}

		if (isPlaying && videoRef.paused) {
			videoRef.play().catch(() => {});
		} else if (!isPlaying && !videoRef.paused) {
			videoRef.pause();
		}
	}

	// Sync video element - only on state changes after video is ready
	$effect(() => {
		const _isPlaying = isPlaying;
		const _videoTimestampMs = videoTimestampMs;

		if (!videoRef || !videoUrl || !videoReady) return;

		const playStateChanged = prevIsPlaying !== undefined && prevIsPlaying !== _isPlaying;
		const timestampChanged = prevVideoTimestampMs !== undefined && prevVideoTimestampMs !== _videoTimestampMs;

		// Update previous state
		prevIsPlaying = _isPlaying;
		prevVideoTimestampMs = _videoTimestampMs;

		// Only sync when state actually changes
		if (playStateChanged || timestampChanged) {
			syncToCorrectPosition();
		}
	});

	// Periodic sync while playing - very infrequent, just to correct drift
	let syncInterval: ReturnType<typeof setInterval> | undefined;
	$effect(() => {
		if (isPlaying && videoRef && videoReady) {
			syncInterval = setInterval(() => {
				if (videoRef) {
					const targetTime = getCurrentTimeSeconds();
					// Only correct if very far off (> 3 seconds)
					if (Math.abs(videoRef.currentTime - targetTime) > 3) {
						videoRef.currentTime = targetTime;
					}
				}
			}, 30000); // Check every 30 seconds
		}
		return () => {
			if (syncInterval) clearInterval(syncInterval);
		};
	});
</script>

{#if videoUrl}
	<div class="w-full aspect-video bg-black rounded-lg overflow-hidden">
		<video
			bind:this={videoRef}
			src={videoUrl}
			class="w-full h-full"
			muted
			playsinline
			onloadedmetadata={handleLoadedMetadata}
		>
			<track kind="captions" />
		</video>
	</div>
{/if}
