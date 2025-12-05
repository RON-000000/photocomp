import { json } from '@sveltejs/kit';
import { getAllCompetitions, getActiveCompetitions, createCompetition } from '$lib/server/models.js';
import { requireRole } from '$lib/server/auth.js';
import { CompetitionCreateSchema, validateOrThrow } from '$lib/server/validation.js';

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

export async function POST(event) {
	try {
		// Require admin role
		await requireRole(event, 'admin');

		const competitionData = await event.request.json();

		// Validate with Zod schema
		const validated = validateOrThrow(CompetitionCreateSchema, competitionData);

		// Additional date validation
		const startDate = new Date(validated.startDate);
		const deadline = new Date(validated.deadline);
		if (startDate >= deadline) {
			return json({ error: 'Deadline muss nach dem Startdatum liegen' }, { status: 400 });
		}

		const competition = await createCompetition(validated);
		return json(competition, { status: 201 });
	} catch (error) {
		console.error('Create competition error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
