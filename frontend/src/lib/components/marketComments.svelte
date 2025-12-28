<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn, formatUsername } from '$lib/utils';
	import type { websocket_api } from 'schema-js';

	let {
		comments,
		marketId,
		ownerId
	} = $props<{
		comments: websocket_api.IMarketComment[];
		marketId: number;
		ownerId: number | null | undefined;
	}>();

	let newComment = $state('');
	let isSubmitting = $state(false);

	function submitComment() {
		if (!newComment.trim() || isSubmitting) return;
		isSubmitting = true;
		sendClientMessage({
			createMarketComment: {
				marketId,
				content: newComment.trim()
			}
		});
		newComment = '';
		isSubmitting = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submitComment();
		}
	}

	function formatTimestamp(timestamp: { seconds?: number | Long | null } | null | undefined): string {
		if (!timestamp?.seconds) return '';
		const seconds = typeof timestamp.seconds === 'number' ? timestamp.seconds : Number(timestamp.seconds);
		const date = new Date(seconds * 1000);
		return date.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function getDisplayName(accountId: number | null | undefined): string {
		const name = accountName(accountId, undefined, { raw: true });
		return formatUsername(name, 'compact');
	}
</script>

<div class="flex flex-col gap-3 p-2">
	<h3 class="text-lg font-semibold">Comments</h3>

	<!-- Comment input -->
	<div class="flex gap-2">
		<Textarea
			placeholder="Add a comment..."
			class="min-h-[2.5rem] resize-none"
			rows={1}
			bind:value={newComment}
			onkeydown={handleKeydown}
		/>
		<Button
			variant="default"
			class="shrink-0"
			disabled={!newComment.trim() || isSubmitting}
			onclick={submitComment}
		>
			Post
		</Button>
	</div>

	<!-- Comments list -->
	<div class="flex max-h-64 flex-col gap-2 overflow-y-auto">
		{#if comments.length === 0}
			<p class="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
		{:else}
			{#each comments as comment (comment.id)}
				<div class="rounded-md border bg-muted/30 p-2">
					<div class="flex items-center gap-1.5 text-sm">
						<span class="font-medium">{getDisplayName(comment.accountId)}</span>
						{#if comment.accountId === ownerId}
							<Tooltip.Root>
								<Tooltip.Trigger>
									<span class="cursor-help">📈</span>
								</Tooltip.Trigger>
								<Tooltip.Content>Market creator</Tooltip.Content>
							</Tooltip.Root>
						{/if}
						<span class="text-xs text-muted-foreground">
							{formatTimestamp(comment.createdAt)}
						</span>
					</div>
					<p class="mt-1 whitespace-pre-wrap text-sm">{comment.content}</p>
				</div>
			{/each}
		{/if}
	</div>
</div>
