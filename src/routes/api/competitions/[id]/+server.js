import { json } from '@sveltejs/kit';
import { getCompetitionById, updateCompetition, deleteCompetition, checkAndUpdateCompetitionStatus } from '$lib/server/models.js';
import { requireRole } from '$lib/server/auth.js';
import { CompetitionUpdateSchema, validateOrThrow } from '$lib/server/validation.js';

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

export async function PUT(event) {
	try {
		// Require admin role
		await requireRole(event, 'admin');

		const updates = await event.request.json();

		// Validate with Zod schema (partial update)
		const validated = validateOrThrow(CompetitionUpdateSchema, updates);

		// Additional date validation if both dates provided
		if (validated.startDate && validated.deadline) {
			const startDate = new Date(validated.startDate);
			const deadline = new Date(validated.deadline);
			if (startDate >= deadline) {
				return json({ error: 'Deadline muss nach dem Startdatum liegen' }, { status: 400 });
			}
		}

		await updateCompetition(event.params.id, validated);
		const updatedCompetition = await getCompetitionById(event.params.id);

		return json(updatedCompetition);
	} catch (error) {
		console.error('Update competition error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}

export async function DELETE(event) {
	try {
		// Require admin role
		await requireRole(event, 'admin');

		await deleteCompetition(event.params.id);

		return json({ success: true, message: 'Competition erfolgreich gelöscht' });
	} catch (error) {
		console.error('Delete competition error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
