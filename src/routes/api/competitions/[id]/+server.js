import { json } from '@sveltejs/kit';
import { getCompetitionById } from '$lib/server/models.js';

export async function GET({ params }) {
	try {
		const competition = await getCompetitionById(params.id);
		
		if (!competition) {
			return json({ error: 'Competition not found' }, { status: 404 });
		}
		
		return json(competition);
	} catch (error) {
		console.error('Get competition error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}