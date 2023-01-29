import dotenv from 'dotenv';
import { LoginServerConnection } from 'ta-network-api';

if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

let credentials = {
	username: process.env.HIREZ_USERNAME,
	passwordHash: process.env.HIREZ_PASSWORD,
	salt: new Uint8Array()
};

const options = {
	authenticate: true,
	debug: false,
	buffer: {
		debug: false
	},
	decoder: {
		clean: true,
		debug: false
	}
};

export const connection = new LoginServerConnection('hirez', credentials, options);
