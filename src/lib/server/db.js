import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

if (!MONGODB_URI) {
	throw new Error('MONGODB_URI is not defined in environment variables');
}

const client = new MongoClient(MONGODB_URI);

let clientPromise;

if (process.env.NODE_ENV === 'development') {
	// In development, use a global variable to preserve the connection
	if (!global._mongoClientPromise) {
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	// In production, create a new connection
	clientPromise = client.connect();
}

export async function getDb() {
	const client = await clientPromise;
	return client.db('photozurich');
}

export async function getCollection(collectionName) {
	const db = await getDb();
	return db.collection(collectionName);
}