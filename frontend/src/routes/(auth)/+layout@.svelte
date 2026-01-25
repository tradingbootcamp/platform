<script lang="ts">
	import '../../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	let { children } = $props();
</script>

<ModeWatcher />
<Toaster closeButton duration={8000} richColors />
{@render children()}
