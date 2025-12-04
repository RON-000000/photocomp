import { json } from '@sveltejs/kit';
import { saveJuryRating } from '$lib/server/models.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const data = await request.json();
		const { submissionId, competitionId, jurorUsername, rating, comment } = data;

		if (!submissionId || !competitionId || !jurorUsername || rating === undefined) {
			return json({ error: 'Fehlende Daten' }, { status: 400 });
		}

		const result = await saveJuryRating({
			submissionId,
			competitionId,
			jurorUsername,
			rating: parseFloat(rating),
			comment: comment || ''
		});

		return json(result);
	} catch (error) {
		console.error('Error saving jury rating:', error);
		return json({ error: 'Fehler beim Speichern der Bewertung' }, { status: 500 });
	}
}
