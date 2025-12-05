import { json } from '@sveltejs/kit';
import { saveJuryRating } from '$lib/server/models.js';
import { requireRole } from '$lib/server/auth.js';
import { JuryRatingSchema, validateOrThrow } from '$lib/server/validation.js';
import { createRateLimiter, RateLimitPresets } from '$lib/server/rateLimit.js';

const rateLimiter = createRateLimiter(RateLimitPresets.MODERATE);

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	try {
		// Apply rate limiting
		await rateLimiter(event);

		// Require jury or admin role
		const user = await requireRole(event, ['jury', 'admin']);

		const data = await event.request.json();

		// Validate with Zod schema
		const validated = validateOrThrow(JuryRatingSchema, data);

		const result = await saveJuryRating({
			submissionId: validated.submissionId,
			competitionId: validated.competitionId,
			jurorUsername: user.username, // Use authenticated user's username
			rating: validated.rating,
			comment: validated.comment
		});

		return json(result);
	} catch (error) {
		console.error('Error saving jury rating:', error);
		return json({ error: error.message || 'Fehler beim Speichern der Bewertung' }, { status: error.status || 500 });
	}
}
