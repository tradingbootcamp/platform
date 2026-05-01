import { websocket_api } from 'schema-js';

const PAUSED = websocket_api.MarketStatus.MARKET_STATUS_PAUSED;
const SEMI_PAUSED = websocket_api.MarketStatus.MARKET_STATUS_SEMI_PAUSED;

export type PauseInterval = { start: number; end: number };

const isPaused = (status: websocket_api.MarketStatus | null | undefined): boolean =>
	status === PAUSED || status === SEMI_PAUSED;

const tsMs = (change: websocket_api.IMarketStatusChange): number => {
	const t = change.transactionTimestamp;
	if (!t) return 0;
	const seconds = typeof t.seconds === 'number' ? t.seconds : Number(t.seconds ?? 0);
	const nanos = t.nanos ?? 0;
	return seconds * 1000 + Math.floor(nanos / 1e6);
};

/**
 * Collapses a market's status-change log into the wall-clock intervals during
 * which the market was paused (PAUSED or SEMI_PAUSED). The list is sorted
 * ascending by start. An open-ended pause currently in effect is clamped to
 * `nowMs` so callers always work with closed intervals.
 *
 * The first entry in `history` is treated as the market's initial state at
 * creation, not a transition — so a market whose first record is PAUSED does
 * NOT yield a pause interval reaching back to creation. This matters because
 * the 20260429_add_market_status_change migration seeded one row per existing
 * market with that market's current status; for markets paused at migration
 * time the seeded row is the only history we have and shouldn't be treated as
 * "this market was paused since creation".
 */
export function pauseIntervals(
	history: websocket_api.IMarketStatusChange[] | undefined,
	nowMs: number
): PauseInterval[] {
	if (!history?.length) return [];
	const sorted = [...history].sort((a, b) => tsMs(a) - tsMs(b));
	const out: PauseInterval[] = [];
	let pausedStart: number | null = null;
	for (let i = 1; i < sorted.length; i++) {
		const change = sorted[i];
		const ms = tsMs(change);
		if (isPaused(change.status)) {
			if (pausedStart === null) pausedStart = ms;
		} else {
			if (pausedStart !== null) {
				if (ms > pausedStart) out.push({ start: pausedStart, end: ms });
				pausedStart = null;
			}
		}
	}
	if (pausedStart !== null && nowMs > pausedStart) {
		out.push({ start: pausedStart, end: nowMs });
	}
	return out;
}

/**
 * Wall-clock ms → market-clock ms. Market-clock subtracts the cumulative
 * paused duration that elapsed strictly before `realMs`. A timestamp that
 * lands inside a pause is clamped to that pause's start.
 */
export function toMarketMs(realMs: number, intervals: PauseInterval[]): number {
	let pausedBefore = 0;
	for (const iv of intervals) {
		if (realMs <= iv.start) break;
		if (realMs >= iv.end) {
			pausedBefore += iv.end - iv.start;
		} else {
			pausedBefore += realMs - iv.start;
		}
	}
	return realMs - pausedBefore;
}

/**
 * Market-clock ms → wall-clock ms. Walks intervals in order, adding each
 * pause's full duration as soon as its market-time position is reached.
 * Inverse of `toMarketMs` for points outside paused windows.
 */
export function toRealMs(marketMs: number, intervals: PauseInterval[]): number {
	let realCursor = marketMs;
	for (const iv of intervals) {
		if (iv.start >= realCursor) break;
		realCursor += iv.end - iv.start;
	}
	return realCursor;
}

/**
 * Convenience: total pause duration that elapsed strictly before `realMs`.
 * Useful for axis tick generation.
 */
export function pausedMsBefore(realMs: number, intervals: PauseInterval[]): number {
	return realMs - toMarketMs(realMs, intervals);
}
