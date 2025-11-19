import { json } from '@sveltejs/kit';
import { getUserByUsername } from '$lib/server/models.js';

export async function GET({ params }) {
	try {
		const user = await getUserByUsername(params.username);
		
		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}
		
		return json(user);
	} catch (error) {
		console.error('Get user error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}