import { json } from '@sveltejs/kit';
import { updateCompetitionStatus } from '$lib/server/models.js';

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	try {
		const { id } = params;
		const { status } = await request.json();

		if (!status || !['active', 'voting', 'completed'].includes(status)) {
			return json({ error: 'Ungültiger Status' }, { status: 400 });
		}

		await updateCompetitionStatus(id, status);

		return json({ success: true, status });
	} catch (error) {
		console.error('Error updating competition status:', error);
		return json({ error: 'Fehler beim Aktualisieren des Status' }, { status: 500 });
	}
}
