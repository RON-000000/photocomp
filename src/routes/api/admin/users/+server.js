import { json } from '@sveltejs/kit';
import { getAllUsersWithRoles } from '$lib/server/models.js';
import { requireRole } from '$lib/server/auth.js';

export async function GET(event) {
	try {
		// Require admin role
		await requireRole(event, 'admin');

		const users = await getAllUsersWithRoles();
		return json(users);
	} catch (error) {
		console.error('Get users error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
