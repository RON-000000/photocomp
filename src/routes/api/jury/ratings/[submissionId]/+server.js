import { json } from '@sveltejs/kit';
import { getJuryRating } from '$lib/server/models.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	try {
		const { submissionId } = params;
		const jurorUsername = url.searchParams.get('jurorUsername');

		if (!jurorUsername) {
			return json({ error: 'Juror Username erforderlich' }, { status: 400 });
		}

		const rating = await getJuryRating(submissionId, jurorUsername);

		if (rating) {
			return json({ rating: rating.rating, comment: rating.comment });
		} else {
			return json({ rating: null });
		}
	} catch (error) {
		console.error('Error getting jury rating:', error);
		return json({ error: 'Fehler beim Laden der Bewertung' }, { status: 500 });
	}
}
