import { json } from '@sveltejs/kit';
import { getCompetitionById, updateCompetition, deleteCompetition, checkAndUpdateCompetitionStatus } from '$lib/server/models.js';

export async function GET({ params }) {
	try {
		// Check and update status automatically
		const competition = await checkAndUpdateCompetitionStatus(params.id);

		if (!competition) {
			return json({ error: 'Competition nicht gefunden' }, { status: 404 });
		}

		return json(competition);
	} catch (error) {
		console.error('Get competition error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export async function PUT({ params, request }) {
	try {
		// Check authentication
		const authHeader = request.headers.get('authorization');
		if (!authHeader) {
			return json({ error: 'Nicht authentifiziert' }, { status: 401 });
		}

		const updates = await request.json();

		// Validate dates if provided
		if (updates.startDate && updates.deadline) {
			const startDate = new Date(updates.startDate);
			const deadline = new Date(updates.deadline);
			if (startDate >= deadline) {
				return json({ error: 'Deadline muss nach dem Startdatum liegen' }, { status: 400 });
			}
		}

		// Validate voting weights if provided
		if (updates.votingWeight) {
			const totalWeight = (updates.votingWeight.community || 0) + (updates.votingWeight.jury || 0);
			if (Math.abs(totalWeight - 1) > 0.01) {
				return json({ error: 'Voting-Gewichte müssen zusammen 1.0 ergeben' }, { status: 400 });
			}
		}

		await updateCompetition(params.id, updates);
		const updatedCompetition = await getCompetitionById(params.id);

		return json(updatedCompetition);
	} catch (error) {
		console.error('Update competition error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE({ params, request }) {
	try {
		// Check authentication
		const authHeader = request.headers.get('authorization');
		if (!authHeader) {
			return json({ error: 'Nicht authentifiziert' }, { status: 401 });
		}

		await deleteCompetition(params.id);

		return json({ success: true, message: 'Competition erfolgreich gelöscht' });
	} catch (error) {
		console.error('Delete competition error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
