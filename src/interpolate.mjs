/**
 * Linearly interpolate between two values (`start` and `end`) by some percentage amount (`t`).
 * @param { number } start 
 * @param { number } end 
 * @param { number } t 
 * @returns The interpolated value.
 */
function lerp (start, end, t) {
    return (1 - t) * start + t * end;
}

/**
 * Sample a subset of datapoints from a timeseries, interpolating between points if necessary.
 * @param { { [timestamp: string]: { [serverId: string]: number } } } data The input timeseries data.
 * @param { number } from The start timestamp.
 * @param { number } to The end timestamp.
 * @param { number } interval The interval at which the timeseries should be sampled.
 * @returns { { [timestamp: string]: number } } The interpolated subset.
 */
export function interpolate (data, from, to, interval) {
	const output = {};

	const entriesWithinTimeframe = Object.entries(data)
		.map(([key, value]) => {
			return [
				parseInt(key),
				value && typeof value === 'object' ? Object.values(value).reduce((previousNumber, currentNumber) => previousNumber + currentNumber) : 0
			]
		})
		.filter(([timestamp]) => from <= timestamp && timestamp <= to)
		.sort(([aTimestamp], [bTimestamp]) => aTimestamp - bTimestamp);
	
	// Pad this range.
	entriesWithinTimeframe.push([Number.MAX_SAFE_INTEGER]);

	const timeDifference = Math.max(from, to) - Math.min(from, to);
	const numberOfOutputs = timeDifference / interval;

	for (let i = 0; i < numberOfOutputs; i++) {
		const intervalTime = to - interval * i;
		let nearestIndex = 0;
		const nearestGreaterEntry = entriesWithinTimeframe.find(([key], index) => {
			if (key >= intervalTime) {
				nearestIndex = index;
				return true;
			}
			return false;
		});
		const nearestLesserEntry = entriesWithinTimeframe[nearestIndex - 1 < 0 ? 0 : nearestIndex - 1];

		const lerpedValue = Math.round(lerp(
			nearestLesserEntry[1],
			nearestGreaterEntry[1],
			(intervalTime - nearestLesserEntry[0]) / (nearestGreaterEntry[0] - nearestLesserEntry[0])
		));

		output[intervalTime.toString()] = !lerpedValue || isNaN(lerpedValue) || lerpedValue < 0 ? 0 : lerpedValue;
	}

	return output;
}
