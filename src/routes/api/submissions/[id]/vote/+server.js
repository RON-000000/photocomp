import { json } from '@sveltejs/kit';
import { addVoteWithUser } from '$lib/server/models.js';
import { requireAuth } from '$lib/server/auth.js';
import { createRateLimiter, RateLimitPresets } from '$lib/server/rateLimit.js';

const rateLimiter = createRateLimiter(RateLimitPresets.STRICT);

export async function POST(event) {
	try {
		// Apply rate limiting
		await rateLimiter(event);

		// Require authentication
		const user = await requireAuth(event);

		// Use authenticated user's ID
		await addVoteWithUser(event.params.id, user._id);

		return json({ success: true, message: 'Vote erfolgreich hinzugefügt' });
	} catch (error) {
		console.error('Vote error:', error);
		return json({ error: error.message }, { status: error.status || 400 });
	}
}
