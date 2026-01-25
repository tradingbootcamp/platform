import { browser } from '$app/environment';
import { sendClientMessage, serverState } from '$lib/api.svelte';

const STORAGE_KEY = 'universeMode';

// Initialize from localStorage at module load time
function getInitialValue(): boolean {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) {
			return stored === 'true';
		}
	}
	return false;
}

let _enabled = $state(getInitialValue());

function toggle() {
	const wasEnabled = _enabled;
	_enabled = !_enabled;
	if (browser) {
		localStorage.setItem(STORAGE_KEY, String(_enabled));
	}

	// When disabling universe mode while in a non-main universe,
	// switch back to the user's main account
	if (wasEnabled && !_enabled && serverState.currentUniverseId !== 0) {
		const userId = serverState.userId;
		if (userId) {
			sendClientMessage({ actAs: { accountId: userId } });
		}
	}
}

export const universeMode = {
	get enabled() {
		return _enabled;
	},
	toggle,
	handleKeydown(e: KeyboardEvent) {
		if (e.key === 'U' && e.shiftKey && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			toggle();
		}
	}
};
