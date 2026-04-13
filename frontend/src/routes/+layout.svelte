<script lang="ts">
	import { page } from '$app/stores';
	import { kinde } from '$lib/auth.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	// Auth loading state
	let isCheckingAuth = $state(true);
	let isAuthenticated = $state(false);

	// Check if we're on the login page - skip auth check for that route
	let isLoginPage = $derived($page.url.pathname === '/login');

	onMount(async () => {
		// Skip auth check for login page
		if (isLoginPage) {
			isCheckingAuth = false;
			isAuthenticated = true; // Pretend authenticated so content renders
			return;
		}
		isAuthenticated = await kinde.isAuthenticated();
		isCheckingAuth = false;
		if (!isAuthenticated) {
			// Save the current path so we can return here after login
			const currentPath = $page.url.pathname;
			if (currentPath !== '/') {
				sessionStorage.setItem('postLoginRedirect', currentPath);
			}
			kinde.login();
		}
	});

	// Re-check auth when navigating away from login page
	$effect(() => {
		if (!isLoginPage && !isCheckingAuth) {
			kinde.isAuthenticated().then((auth) => {
				isAuthenticated = auth;
			});
		}
	});
</script>

<ModeWatcher />
<Toaster closeButton duration={8000} richColors />
{#if isLoginPage}
	{@render children()}
{:else if isCheckingAuth}
	<div class="flex min-h-screen items-center justify-center">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
	</div>
{:else if !isAuthenticated}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-muted-foreground">Redirecting to login...</p>
	</div>
{:else}
	{@render children()}
{/if}
