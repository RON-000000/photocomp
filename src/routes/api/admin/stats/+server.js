import { json } from '@sveltejs/kit';
import { getAdminStats } from '$lib/server/models.js';
import { requireRole } from '$lib/server/auth.js';

export async function GET(event) {
	try {
		// Require admin role
		await requireRole(event, 'admin');

		const stats = await getAdminStats();
		return json(stats);
	} catch (error) {
		console.error('Get stats error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
