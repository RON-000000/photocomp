import { json } from '@sveltejs/kit';
import { getJuryCompetitions } from '$lib/server/models.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		// Get username from query parameter
		const username = url.searchParams.get('username');

		if (!username) {
			return json({ error: 'Username erforderlich' }, { status: 400 });
		}

		// Find competitions where user is a jury member
		const competitions = await getJuryCompetitions(username);

		return json(competitions);
	} catch (error) {
		console.error('Error fetching jury competitions:', error);
		return json({ error: 'Fehler beim Laden der Competitions' }, { status: 500 });
	}
}
