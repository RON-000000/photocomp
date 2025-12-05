import { json } from '@sveltejs/kit';
import { createSubmission } from '$lib/server/models.js';
import { requireAuth } from '$lib/server/auth.js';
import { SubmissionCreateSchema, validateOrThrow } from '$lib/server/validation.js';
import { createRateLimiter, RateLimitPresets } from '$lib/server/rateLimit.js';

const rateLimiter = createRateLimiter(RateLimitPresets.MODERATE);

export async function POST(event) {
	try {
		// Apply rate limiting
		await rateLimiter(event);

		// Require authentication
		const user = await requireAuth(event);

		const submissionData = await event.request.json();

		// Validate with Zod schema
		const validated = validateOrThrow(SubmissionCreateSchema, submissionData);

		// Use authenticated user's ID
		const submission = await createSubmission({
			...validated,
			userId: user._id  // Override with authenticated user
		});

		return json(submission, { status: 201 });
	} catch (error) {
		console.error('Create submission error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
