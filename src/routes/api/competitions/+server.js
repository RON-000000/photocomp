import { json } from '@sveltejs/kit';
import { getAllCompetitions, getActiveCompetitions, createCompetition } from '$lib/server/models.js';

export async function GET({ url }) {
	try {
		const status = url.searchParams.get('status');
		
		if (status === 'active') {
			const competitions = await getActiveCompetitions();
			return json(competitions);
		}
		
		const competitions = await getAllCompetitions();
		return json(competitions);
	} catch (error) {
		console.error('Get competitions error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const competitionData = await request.json();
		
		// TODO: Add admin check middleware
		
		// Validate required fields
		if (!competitionData.title || !competitionData.description || !competitionData.deadline) {
			return json({ error: 'Titel, Beschreibung und Deadline sind erforderlich' }, { status: 400 });
		}
		
		const competition = await createCompetition(competitionData);
		return json(competition);
	} catch (error) {
		console.error('Create competition error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}