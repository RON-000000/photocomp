import { json } from '@sveltejs/kit';
import { getSubmissionById, deleteSubmission } from '$lib/server/models.js';

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

export async function DELETE({ params, request }) {
	try {
		const { userId } = await request.json();

		if (!userId) {
			return json({ error: 'User ID erforderlich' }, { status: 400 });
		}

		await deleteSubmission(params.id, userId);

		return json({ success: true, message: 'Submission erfolgreich gelöscht' });
	} catch (error) {
		console.error('Delete submission error:', error);
		return json({ error: error.message }, { status: 400 });
	}
}
