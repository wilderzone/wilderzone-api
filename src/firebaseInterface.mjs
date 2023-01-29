import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';

if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getFirestore(firebaseApp);
const newsCollection = collection(database, process.env.NEWS_COLLECTION_URL);
const historyDocument = doc(database, process.env.HISTORY_DOCUMENT_URL_HIREZ);

function filterHistoryData (data) {
	return data
		.filter((server) => {
			return server && 'id' in server && 'numberOfPlayers' in server && server.numberOfPlayers > 0;
		})
		.map((server) => {
			return {
				id: server.id,
				numberOfPlayers: server.numberOfPlayers
			}
		});
}

export async function saveHistoryDataToFirebase (time, data) {
	const filteredData = filterHistoryData(data);
	if (filteredData.length <= 0) {
		return;
	}

	const output = {};
	output[time] = {};

	for (const { id, numberOfPlayers } of filteredData) {
		output[time][id] = numberOfPlayers;
	}

	// Save to Firebase.
	await updateDoc(historyDocument, output);
}

export async function loadAllHistoryFromFirebase () {
	const snapshot = await getDoc(historyDocument);
	if (snapshot.exists()) {
		return snapshot.data();
	}
	return {};
}

export async function getAllNews() {
	const snapshot = await getDocs(newsCollection);
	const output = [];
	snapshot.forEach((document) => {
		const docData = document.data();
		if (!docData.date) {
			docData.date = 0;
		}
		output.push(docData);
	});
	output.sort((a, b) => b.date - a.date);
	return output;
}

export async function getLatestNews() {
	const allNews = await getAllNews();
	return allNews[0] ?? {};
}
