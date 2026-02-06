import { browser } from '$app/environment';

const STORAGE_KEY = 'dieRollVisible';

function getInitialValue(): boolean {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) {
			return stored === 'true';
		}
	}
	return true;
}

let _visible = $state(getInitialValue());

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
