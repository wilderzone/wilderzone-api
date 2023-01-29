import { connection } from './loginServer.mjs';
import { saveHistoryDataToFirebase } from './firebaseInterface.mjs';

export class Cache {
	#cache = {
		'OnlinePlayerList': {
			time: 0,
			data: []
		},
		'GameServerList': {
			time: 0,
			data: []
		}
	};
	#ttl = {
		active: 4 * 60 * 1000, // 4 minutes.
		passive: 15 * 60 * 1000 // 15 minutes.
	};
	#initialized = false;
	#loading = false;
	#timeout = 60000; // 1 minute.
	#timeoutTimers = [];

	constructor () {}

	/**
	 * Initialize the cache.
	 */
	async init () {
		if (this.#initialized) {
			return;
		}

		this.#loading = false;
		await this.#refresh();
		this.#setIntervals();
		this.#initialized = true;
	}

	#setIntervals () {
		setInterval(() => {
			this.#refresh();
		}, this.#ttl.passive);
	}

	/**
	 * Fetch new data to refresh the state of the cache.
	 */
	async #refresh () {
		if (!this.#initialized || this.#loading) {
			return;
		}

		// Set the loading state.
		this.#loading = true;

		// Prevent the loading state from getting stuck if the data fetch never completes.
		this.#timeoutTimers.push(setTimeout(() => {
			this.#loading = false;
		}, this.#timeout));

		// Fetch the data.
		try {
			const time = Date.now();
			await connection.connect();
			console.log('Connected');
			for (const endpoint of Object.keys(this.#cache)) {
				this.#cache[endpoint].time = time;
				this.#cache[endpoint].data = await connection.fetch(endpoint);
				console.log('Fetched', endpoint);
			}
			await connection.disconnect();
			await saveHistoryDataToFirebase(time, this.#cache['GameServerList'].data);
			console.log('Saved to Firestore');
		} catch (e) {
			console.warn('Failed to refresh cache @', new Date().toISOString(), ':', e);
		}

		// Reset the loading timeout.
		this.#timeoutTimers.forEach((id) => {
			clearTimeout(id);
		});

		// Clear the loading state.
		this.#loading = false;
	}

	/**
	 * Save a snapshot of the cache to persistent storage.
	 */
	saveState () {
		const snapshot = JSON.stringify(this.#cache);
		return snapshot;
	}

	/**
	 * Prevent the cache from refreshing. The cache must be re-initialized before it can be used again.
	 */
	stop () {
		// Reset any existing loading timeouts.
		this.#timeoutTimers.forEach((id) => {
			clearTimeout(id);
		});

		// Set the loading state `true` to prevent further use.
		this.#loading = true;
	}

	get OnlinePlayerList () {
		const time = Date.now();
		if (this.#cache.OnlinePlayerList.time < time - this.#ttl.active) {
			this.#refresh();
		}
		return this.#cache.OnlinePlayerList.data;
	}

	get OnlinePlayerNumber () {
		const time = Date.now();
		if (this.#cache.OnlinePlayerList.time < time - this.#ttl.active) {
			this.#refresh();
		}
		return this.#cache.OnlinePlayerList.data.length ?? 0;
	}

	get GameServerList () {
		const time = Date.now();
		if (this.#cache.GameServerList.time < time - this.#ttl.active) {
			this.#refresh();
		}
		return this.#cache.GameServerList.data;
	}

	get GameServerNumber () {
		const time = Date.now();
		if (this.#cache.GameServerList.time < time - this.#ttl.active) {
			this.#refresh();
		}
		return this.#cache.GameServerList.data.length ?? 0;
	}

	get PopulatedGameServerList () {
		const time = Date.now();
		if (this.#cache.GameServerList.time < time - this.#ttl.active) {
			this.#refresh();
		}
		return this.#cache.GameServerList.data.filter((value) => value.numberOfPlayers > 0);
	}

	get PopulatedGameServerNumber () {
		const time = Date.now();
		if (this.#cache.GameServerList.time < time - this.#ttl.active) {
			this.#refresh();
		}
		return this.#cache.GameServerList.data.filter((value) => value.numberOfPlayers > 0).length ?? 0;
	}
}
