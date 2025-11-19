import { json } from '@sveltejs/kit';
import { getAllUsers, createUser, getUserByUsername } from '$lib/server/models.js';

export async function GET() {
	try {
		const users = await getAllUsers();
		return json(users);
	} catch (error) {
		console.error('Get users error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const userData = await request.json();
		
		// Check if username already exists
		const existing = await getUserByUsername(userData.username);
		if (existing) {
			return json({ error: 'Username already taken' }, { status: 400 });
		}
		
		const user = await createUser(userData);
		return json(user, { status: 201 });
	} catch (error) {
		console.error('Create user error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}