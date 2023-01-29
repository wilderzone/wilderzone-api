import { interpolate } from "../src/interpolate.mjs";

const data = {
	'1674353040237': { '53833': 3 },
	'1674351240236': { '53833': 1 },
	'1674346813693': { '10285': 10 },
	'1674352140236': { '53833': 1 },
	'1674347722338': { '10285': 1 },
	'1674631908389': { '53833': 10, '10285': 2 },
	'1674632804843': { '53833': 7 },
	'1674633706154': { '53833': 9 },
	'1674634602347': { '53833': 8, '10285': 1 },
	'1674635002363': { '53833': 4, '10285': 2 },
	'1674635905481': { '53833': 1 },
	'1674639009342': { '53833': 4 }
};
const startTime = 1674633500000;
const endTime = 1674637100000;
const interval = 600000; // 10 minutes.

const expectedResult = {
	'1674637100000': 0,
	'1674636500000': 0,
	'1674635900000': 1,
	'1674635300000': 4,
	'1674634700000': 8,
	'1674634100000': 9
};

console.log('Testing interpolate.');

const result = interpolate(data, startTime, endTime, interval);

console.log(result);
console.log(JSON.stringify(result) === JSON.stringify(expectedResult) ? 'Passed.' : 'Failed.');
