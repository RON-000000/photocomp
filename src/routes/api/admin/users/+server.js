import { json } from '@sveltejs/kit';
import { getAllUsersWithRoles } from '$lib/server/models.js';

export async function GET({ request }) {
	try {
		// TODO: Add admin check middleware
		const users = await getAllUsersWithRoles();
		return json(users);
	} catch (error) {
		console.error('Get users error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}