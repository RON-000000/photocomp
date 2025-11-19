import { json } from '@sveltejs/kit';
import { getSubmissionsByCompetitionId } from '$lib/server/models.js';

export async function GET({ params }) {
	try {
		const submissions = await getSubmissionsByCompetitionId(params.id);
		return json(submissions);
	} catch (error) {
		console.error('Get submissions error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}