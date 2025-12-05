import { json } from '@sveltejs/kit';
import { getSubmissionById, deleteSubmission } from '$lib/server/models.js';
import { requireAuth, checkOwnership } from '$lib/server/auth.js';

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

export async function DELETE(event) {
	try {
		// Require authentication
		const user = await requireAuth(event);

		// Get submission to check ownership
		const submission = await getSubmissionById(event.params.id);

		if (!submission) {
			return json({ error: 'Submission nicht gefunden' }, { status: 404 });
		}

		// Check if user owns the submission or is admin
		if (!checkOwnership(user, submission.userId)) {
			return json({ error: 'Keine Berechtigung zum Löschen dieser Submission' }, { status: 403 });
		}

		await deleteSubmission(event.params.id, user._id);

		return json({ success: true, message: 'Submission erfolgreich gelöscht' });
	} catch (error) {
		console.error('Delete submission error:', error);
		return json({ error: error.message }, { status: error.status || 400 });
	}
}
