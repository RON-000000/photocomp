import { json } from '@sveltejs/kit';
import { addComment } from '$lib/server/models.js';
import { requireAuth } from '$lib/server/auth.js';
import { CommentCreateSchema, validateOrThrow } from '$lib/server/validation.js';
import { createRateLimiter, RateLimitPresets } from '$lib/server/rateLimit.js';

const rateLimiter = createRateLimiter(RateLimitPresets.MODERATE);

export async function POST(event) {
	try {
		// Apply rate limiting
		await rateLimiter(event);

		// Require authentication
		const user = await requireAuth(event);

		const commentData = await event.request.json();

		// Validate with Zod schema
		const validated = validateOrThrow(CommentCreateSchema, commentData);

		// Use authenticated user's data
		const comment = await addComment(event.params.id, {
			userId: user._id,
			username: user.username,
			text: validated.text
		});

		return json({ success: true, comment });
	} catch (error) {
		console.error('Comment error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
