import { json } from '@sveltejs/kit';
import { getAdminStats } from '$lib/server/models.js';

export async function GET({ request }) {
	try {
		// TODO: Add admin check middleware
		const stats = await getAdminStats();
		return json(stats);
	} catch (error) {
		console.error('Get stats error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}