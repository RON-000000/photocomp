import { json } from '@sveltejs/kit';
import { updateUserRole } from '$lib/server/models.js';

export async function POST({ request, params }) {
	try {
		const { role } = await request.json();
		const userId = params.id;
		
		// TODO: Add admin check middleware
		
		const updatedUser = await updateUserRole(userId, role);
		return json(updatedUser);
	} catch (error) {
		console.error('Update role error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}