import { json } from '@sveltejs/kit';
import { getUserByUsername } from '$lib/server/models.js';

export async function GET({ params }) {
	try {
		const user = await getUserByUsername(params.username);
		
		// Remove sensitive data
		const { password, ...safeUser } = user;
		
		return json(safeUser);
	} catch (error) {
		console.error('Get user error:', error);
		
		if (error.message === 'User nicht gefunden') {
			return json({ error: error.message }, { status: 404 });
		}
		
		return json({ error: error.message }, { status: 500 });
	}
}