import { json } from '@sveltejs/kit';
import { getJuryCompetitions } from '$lib/server/models.js';
import { requireRole } from '$lib/server/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
	try {
		// Require jury or admin role
		const user = await requireRole(event, ['jury', 'admin']);

		// Use authenticated user's username
		const competitions = await getJuryCompetitions(user.username);

		return json(competitions);
	} catch (error) {
		console.error('Error fetching jury competitions:', error);
		return json({ error: error.message || 'Fehler beim Laden der Competitions' }, { status: error.status || 500 });
	}
}
