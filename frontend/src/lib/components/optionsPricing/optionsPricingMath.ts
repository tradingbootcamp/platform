export interface ControlPoint {
	x: number; // Stock price (0, 2, 4, ..., 30)
	y: number; // Probability density (unnormalized)
}

export interface OptionPrice {
	strike: number;
	callPrice: number;
	putPrice: number;
}

/**
 * Initialize 16 control points with uniform distribution
 * Points at x = 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30
 */
export function initializeUniformDistribution(): ControlPoint[] {
	const points: ControlPoint[] = [];
	for (let x = 0; x <= 30; x += 2) {
		points.push({ x, y: 1 });
	}
	return points;
}

/**
 * Calculate total area under the PDF using trapezoidal rule
 */
function calculateArea(points: ControlPoint[]): number {
	let totalArea = 0;
	for (let i = 0; i < points.length - 1; i++) {
		const dx = points[i + 1].x - points[i].x;
		const avgY = (points[i].y + points[i + 1].y) / 2;
		totalArea += dx * avgY;
	}
	return totalArea;
}

/**
 * Normalize the PDF so that total probability = 1
 * Uses trapezoidal integration over the discrete points
 */
export function normalizePDF(points: ControlPoint[]): ControlPoint[] {
	const totalArea = calculateArea(points);

	if (totalArea === 0) {
		// Avoid division by zero - reset to uniform
		return initializeUniformDistribution();
	}

	// Normalize each point
	return points.map((p) => ({
		x: p.x,
		y: p.y / totalArea
	}));
}

/**
 * Calculate option prices using trapezoidal integration
 *
 * Call price = integral from K to infinity of (S - K) * f(S) dS
 * Put price = integral from 0 to K of (K - S) * f(S) dS
 *
 * Since our domain is [0, 30], we treat 30 as "infinity"
 */
export function calculateOptionPrices(rawPoints: ControlPoint[], strikes: number[]): OptionPrice[] {
	// First normalize the PDF
	const points = normalizePDF(rawPoints);

	return strikes.map((K) => {
		let callPrice = 0;
		let putPrice = 0;

		for (let i = 0; i < points.length - 1; i++) {
			const x1 = points[i].x;
			const x2 = points[i + 1].x;
			const y1 = points[i].y;
			const y2 = points[i + 1].y;

			// Determine segment's relationship to strike K
			if (x2 <= K) {
				// Entire segment is below strike - contributes to put
				// Put payoff = K - S
				const avgPayoff = K - (x1 + x2) / 2;
				const avgDensity = (y1 + y2) / 2;
				const dx = x2 - x1;
				putPrice += avgPayoff * avgDensity * dx;
			} else if (x1 >= K) {
				// Entire segment is above strike - contributes to call
				// Call payoff = S - K
				const avgPayoff = (x1 + x2) / 2 - K;
				const avgDensity = (y1 + y2) / 2;
				const dx = x2 - x1;
				callPrice += avgPayoff * avgDensity * dx;
			} else {
				// Segment straddles the strike K - split into two parts
				const t = (K - x1) / (x2 - x1); // Interpolation factor
				const yK = y1 + t * (y2 - y1); // Density at strike

				// Part below strike (put)
				const avgPayoffPut = K - (x1 + K) / 2;
				const avgDensityPut = (y1 + yK) / 2;
				putPrice += avgPayoffPut * avgDensityPut * (K - x1);

				// Part above strike (call)
				const avgPayoffCall = (K + x2) / 2 - K;
				const avgDensityCall = (yK + y2) / 2;
				callPrice += avgPayoffCall * avgDensityCall * (x2 - K);
			}
		}

		return {
			strike: K,
			callPrice: Math.max(0, callPrice),
			putPrice: Math.max(0, putPrice)
		};
	});
}
