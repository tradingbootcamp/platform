import { browser } from '$app/environment';
import { scenariosApi } from '$lib/scenariosApi';
import type { components } from '$lib/api.generated';

type ClockResponse = components['schemas']['ClockResponse'];
type DieRollResponse = components['schemas']['DieRollResponse'];
type AllRollsResponse = components['schemas']['AllRollsResponse'];

let clocks = $state<ClockResponse[]>([]);
let myRolls = $state<DieRollResponse[]>([]);
let allRolls = $state<AllRollsResponse[]>([]);
let tick = $state(0);

if (browser) {
	setInterval(() => {
		tick++;
	}, 1000);
}

function getClockSeconds(clock: ClockResponse): number {
	void tick;
	if (clock.is_running) {
		return Date.now() / 1000 - clock.start_time;
	}
	return clock.local_time;
}

function formatClockTime(clock: ClockResponse): string {
	const seconds = getClockSeconds(clock);
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function fetchClocks() {
	try {
		const { data } = await scenariosApi.GET('/clocks');
		if (data) clocks = data;
	} catch {
		// Ignore errors
	}
}

async function fetchMyRolls() {
	try {
		const { data } = await scenariosApi.GET('/my-rolls');
		if (data) myRolls = data;
	} catch {
		// Ignore errors
	}
}

async function fetchAllRolls() {
	try {
		const { data } = await scenariosApi.GET('/all-rolls');
		if (data) allRolls = data;
	} catch {
		// Ignore errors (non-admin will 403)
	}
}

export const scenarioData = {
	get clocks() {
		return clocks;
	},
	get clocksByName(): Map<string, ClockResponse> {
		return new Map(clocks.map((c) => [c.name, c]));
	},
	get myRolls() {
		return myRolls;
	},
	get allRolls() {
		return allRolls;
	},
	get tick() {
		return tick;
	},
	getClockSeconds,
	formatClockTime,
	fetchClocks,
	fetchMyRolls,
	fetchAllRolls
};
