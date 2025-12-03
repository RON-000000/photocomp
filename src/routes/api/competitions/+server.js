import { json } from '@sveltejs/kit';
import { getAllCompetitions, getActiveCompetitions, createCompetition, getUserByAuth0Id } from '$lib/server/models.js';

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

export async function POST({ request, cookies }) {
	try {
		// Check authentication
		const authHeader = request.headers.get('authorization');
		if (!authHeader) {
			return json({ error: 'Nicht authentifiziert' }, { status: 401 });
		}

		// Note: In production, verify the Auth0 token here
		// For now, we'll check if user exists and has admin role
		const competitionData = await request.json();

		// Validate required fields
		if (!competitionData.title || !competitionData.description || !competitionData.deadline) {
			return json({ error: 'Titel, Beschreibung und Deadline sind erforderlich' }, { status: 400 });
		}

		if (!competitionData.startDate) {
			return json({ error: 'Startdatum ist erforderlich' }, { status: 400 });
		}

		if (!competitionData.theme) {
			return json({ error: 'Thema ist erforderlich' }, { status: 400 });
		}

		// Validate dates
		const startDate = new Date(competitionData.startDate);
		const deadline = new Date(competitionData.deadline);
		if (startDate >= deadline) {
			return json({ error: 'Deadline muss nach dem Startdatum liegen' }, { status: 400 });
		}

		// Validate voting weights
		const totalWeight = (competitionData.votingWeight?.community || 0) + (competitionData.votingWeight?.jury || 0);
		if (Math.abs(totalWeight - 1) > 0.01) {
			return json({ error: 'Voting-Gewichte müssen zusammen 1.0 ergeben' }, { status: 400 });
		}

		const competition = await createCompetition(competitionData);
		return json(competition, { status: 201 });
	} catch (error) {
		console.error('Create competition error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}