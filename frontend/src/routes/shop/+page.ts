import { redirect } from '@sveltejs/kit';

// TEMPORARY: Redirect shop to home while shop is disabled
// All existing shop code is preserved in +page.svelte
export function load() {
	// redirect(307, '/market');
}
