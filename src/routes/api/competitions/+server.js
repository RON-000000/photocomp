import { json } from '@sveltejs/kit';
import { getAllCompetitions, getActiveCompetitions, getCompletedCompetitions } from '$lib/server/models.js';

export async function GET({ url }) {
	try {
		const filter = url.searchParams.get('filter');
		
		let competitions;
		if (filter === 'active') {
			competitions = await getActiveCompetitions();
		} else if (filter === 'completed') {
			competitions = await getCompletedCompetitions();
		} else {
			competitions = await getAllCompetitions();
		}
		
		return json(competitions);
	} catch (error) {
		console.error('Get competitions error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}