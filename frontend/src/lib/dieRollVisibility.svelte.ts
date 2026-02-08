import { browser } from '$app/environment';

const STORAGE_KEY = 'dieRollVisible';

function getInitialValue(): boolean {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) {
			return stored === 'true';
		}
	}
	return false;
}

let _visible = $state(getInitialValue());

if (browser) {
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY && e.newValue !== null) {
			_visible = e.newValue === 'true';
		}
	});
}

export const dieRollVisibility = {
	get visible() {
		return _visible;
	},
	toggle() {
		_visible = !_visible;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, String(_visible));
		}
	}
};
