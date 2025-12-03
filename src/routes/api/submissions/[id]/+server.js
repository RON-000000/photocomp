import { json } from '@sveltejs/kit';
import { getSubmissionById } from '$lib/server/models.js';

export async function GET({ params }) {
	try {
		const submission = await getSubmissionById(params.id);

		if (!submission) {
			return json({ error: 'Submission nicht gefunden' }, { status: 404 });
		}

		return json(submission);
	} catch (error) {
		console.error('Get submission error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
