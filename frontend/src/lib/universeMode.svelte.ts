import { browser } from '$app/environment';

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
	_enabled = !_enabled;
	if (browser) {
		localStorage.setItem(STORAGE_KEY, String(_enabled));
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
