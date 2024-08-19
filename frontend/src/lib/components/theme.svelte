<script lang="ts">
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';

	import { Button } from '$lib/components/ui/button';
	import { toggleMode } from 'mode-watcher';
</script>

<Button on:click={toggleMode} size="icon">
	<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
	<Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
	<span class="sr-only">Toggle theme</span>
</Button>
