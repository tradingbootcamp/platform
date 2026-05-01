<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { Button } from '$lib/components/ui/button';
	import GenerateRedeemCode from '$lib/components/forms/generateRedeemCode.svelte';
	import { cn } from '$lib/utils';

	const LETTERS = /^[A-Z]$/;
	const DIGITS = /^[0-9]$/;

	// Six positions: indexes 0..2 letters, 3..5 digits.
	let chars = $state(['', '', '', '', '', '']);
	let inputs: HTMLInputElement[] = $state([]);
	let pending = $state(false);
	let lastClaimedCode = $state<string | null>(null);

	const isLetterIdx = (i: number) => i < 3;
	const charValid = (i: number, c: string) => (isLetterIdx(i) ? LETTERS.test(c) : DIGITS.test(c));

	let assembled = $derived(`${chars.slice(0, 3).join('')}-${chars.slice(3, 6).join('')}`);
	let complete = $derived(chars.every((c) => c.length === 1));

	$effect(() => {
		const claimed = serverState.lastClaimedRedeemCode;
		if (pending && claimed && claimed.code !== lastClaimedCode) {
			pending = false;
			lastClaimedCode = claimed.code;
			chars = ['', '', '', '', '', ''];
			inputs[0]?.focus();
		}
	});

	function focusIndex(i: number) {
		const el = inputs[Math.max(0, Math.min(5, i))];
		el?.focus();
		el?.select();
	}

	function handleInput(i: number, e: Event) {
		const input = e.target as HTMLInputElement;
		const raw = input.value;
		// Pasting more than 1 char into a box: route through the paste handler.
		if (raw.length > 1) {
			distributePaste(i, raw);
			return;
		}
		const c = raw.toUpperCase();
		if (c === '') {
			chars[i] = '';
			return;
		}
		if (!charValid(i, c)) {
			input.value = chars[i];
			return;
		}
		chars[i] = c;
		input.value = c;
		if (i < 5) focusIndex(i + 1);
	}

	function handleKeyDown(i: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && chars[i] === '' && i > 0) {
			focusIndex(i - 1);
			e.preventDefault();
		} else if (e.key === 'ArrowLeft' && i > 0) {
			focusIndex(i - 1);
			e.preventDefault();
		} else if (e.key === 'ArrowRight' && i < 5) {
			focusIndex(i + 1);
			e.preventDefault();
		} else if (e.key === 'Enter' && complete) {
			submit();
		}
	}

	function distributePaste(startIdx: number, raw: string) {
		// Strip dashes/whitespace, normalise case.
		const cleaned = raw.replace(/[\s-]+/g, '').toUpperCase();
		let cursor = startIdx;
		for (const ch of cleaned) {
			if (cursor > 5) break;
			if (charValid(cursor, ch)) {
				chars[cursor] = ch;
				cursor += 1;
			} else {
				// Stop on first invalid character so we don't scramble the pin.
				break;
			}
		}
		focusIndex(cursor);
	}

	function handlePaste(i: number, e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text');
		if (!text) return;
		e.preventDefault();
		distributePaste(i, text);
	}

	function submit() {
		if (!complete || pending) return;
		pending = true;
		sendClientMessage({ claimRedeemCode: { code: assembled } });
	}

	function clearAll() {
		chars = ['', '', '', '', '', ''];
		focusIndex(0);
	}
</script>

<div class="mx-auto flex max-w-md flex-col gap-8 pt-12">
	<div class="space-y-1 text-center">
		<h1 class="text-2xl font-bold">Redeem code</h1>
		<p class="text-sm text-muted-foreground">
			Enter the six-character code an admin shared with you to receive clips.
		</p>
	</div>

	<form
		class="flex flex-col items-center gap-6"
		onsubmit={(e) => {
			e.preventDefault();
			submit();
		}}
	>
		<div class="flex items-center justify-center gap-2">
			{#each chars as char, i (i)}
				<input
					bind:this={inputs[i]}
					type="text"
					inputmode={isLetterIdx(i) ? 'text' : 'numeric'}
					maxlength="1"
					autocomplete="off"
					autocapitalize="characters"
					spellcheck="false"
					value={char}
					oninput={(e) => handleInput(i, e)}
					onkeydown={(e) => handleKeyDown(i, e)}
					onpaste={(e) => handlePaste(i, e)}
					onfocus={(e) => (e.target as HTMLInputElement).select()}
					class={cn(
						'h-14 w-12 rounded-md border-2 bg-background text-center font-mono text-2xl font-semibold uppercase',
						'border-input focus:border-primary focus:outline-none'
					)}
					aria-label={isLetterIdx(i) ? `Letter ${i + 1}` : `Digit ${i - 2}`}
				/>
				{#if i === 2}
					<span class="text-2xl text-muted-foreground" aria-hidden="true">–</span>
				{/if}
			{/each}
		</div>

		<div class="flex w-full gap-2">
			<Button type="button" class="flex-1" variant="outline" onclick={clearAll}>Clear</Button>
			<Button type="submit" class="flex-1" disabled={!complete || pending}>
				{pending ? 'Redeeming…' : 'Redeem'}
			</Button>
		</div>
	</form>

	{#if lastClaimedCode}
		<p class="text-center text-sm text-muted-foreground">
			Last redeemed: <span class="font-mono">{lastClaimedCode}</span>
		</p>
	{/if}

	{#if serverState.isAdmin}
		<div class="mt-4 flex flex-col items-center gap-2 border-t pt-6">
			<p class="text-sm text-muted-foreground">Admin: mint a new redeem code.</p>
			<GenerateRedeemCode />
		</div>
	{/if}
</div>
