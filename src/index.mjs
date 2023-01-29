import * as fs from 'fs/promises';
import express from 'express';
import { Cache } from './cache.mjs';
import { loadAllHistoryFromFirebase, getAllNews, getLatestNews } from './firebaseInterface.mjs';
import { interpolate } from './interpolate.mjs';


// Fetch the homepage template.
const homepage = await fs.readFile('./src/homepage/index.html', 'utf-8');


// Set up the cache.
console.log('Initalizing the cache...');
const cache = new Cache();
await cache.init();


// Set up the Express application.
console.log('Starting Express...');
const app = express();


// Set up the API endpoints.
app.get('/_ah/start', async (request, response) => {
	console.log('Start request received.');
	response.status(200).send('Started');
});

app.get('/_ah/stop', (request, response) => {
	console.log('Stop request received. Closing connections and stopping the cache...');
	cache.stop();
	console.log('Stopped.');
	response.status(200).send('Stopped');
});

app.get('/', (request, response) => {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.send(homepage);
});

app.get('/online/players/', (request, response) => {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Content-Type', 'application/json');
	if ('simple' in request.query) {
		response.send(JSON.stringify(cache.OnlinePlayerNumber));
		return;
	}
	response.send(JSON.stringify(cache.OnlinePlayerList));
});

app.get('/online/servers/', (request, response) => {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Content-Type', 'application/json');
	if ('simple' in request.query && 'populated' in request.query) {
		response.send(JSON.stringify(cache.PopulatedGameServerNumber));
		return;
	}
	if ('simple' in request.query) {
		response.send(JSON.stringify(cache.GameServerNumber));
		return;
	}
	if ('populated' in request.query) {
		response.send(JSON.stringify(cache.PopulatedGameServerList));
		return;
	}
	response.send(JSON.stringify(cache.GameServerList));
});

app.get('/history/players/', async (request, response) => {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Content-Type', 'application/json');

	// Set the query start time.
	let startTime = Date.now() - 86400000; // 1 day ago.
	if ('from' in request.query) {
		const fromInt = parseInt(request.query['from']);
		if (isNaN(fromInt)) {
			startTime = Date.now() - 86400000; // 1 day ago.
		} else if (request.query['from'].length === 10) {
			startTime = fromInt * 1000;
		} else if (request.query['from'].length === 13) {
			startTime = fromInt;
		}
	}

	// Set the query end time.
	let endTime = Date.now();
	if ('to' in request.query) {
		const toInt = parseInt(request.query['to']);
		if (isNaN(toInt)) {
			endTime = Date.now();
		} else if (request.query['to'].length === 10) {
			endTime = toInt * 1000;
		} else if (request.query['to'].length === 13) {
			endTime = toInt;
		}
	}

	// Set the query interval time.
	let interval = 600000; // 10 minutes.
	if ('interval' in request.query) {
		const intervalInt = parseInt(request.query['interval']);
		if (isNaN(intervalInt)) {
			interval = 600000;
		} else {
			interval = intervalInt * 60000; // Convert minutes to milliseconds.
		}
	}

	const data = await loadAllHistoryFromFirebase();
	response.send(JSON.stringify(interpolate(data, Math.min(startTime, endTime), Math.max(startTime, endTime), interval)));
});

app.get('/news/', async (request, response) => {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Content-Type', 'application/json');
	if ('latest' in request.query) {
		response.send(JSON.stringify(await getLatestNews()));
		return;
	}
	response.send(JSON.stringify(await getAllNews()));
});


// Listen for incoming connections.
const PORT = process.env.PORT || 3002;
app.listen(PORT);

console.log('Ready.');
console.log(`http://localhost:${PORT}/`);
