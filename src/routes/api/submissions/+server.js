import { json } from '@sveltejs/kit';
import { createSubmission, getSubmissionById } from '$lib/server/models.js';

export async function POST({ request }) {
	try {
		const submissionData = await request.json();
		
		// Validate required fields
		if (!submissionData.competitionId || !submissionData.userId || !submissionData.title || !submissionData.imageUrl) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}
		
		const submission = await createSubmission(submissionData);
		return json(submission, { status: 201 });
	} catch (error) {
		console.error('Create submission error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}