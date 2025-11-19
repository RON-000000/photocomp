import { json } from '@sveltejs/kit';
import { addVoteWithUser, getSubmissionById } from '$lib/server/models.js';

export async function POST({ params, request }) {
	try {
		const { userId } = await request.json();
		
		if (!userId) {
			return json({ error: 'User ID erforderlich' }, { status: 400 });
		}
		
		await addVoteWithUser(params.id, userId);
		const submission = await getSubmissionById(params.id);
		
		return json({ 
			success: true, 
			votes: submission.votes,
			votedBy: submission.votedBy || []
		});
	} catch (error) {
		console.error('Vote error:', error);
		
		if (error.message === 'Du hast bereits für diese Submission gevotet') {
			return json({ error: error.message }, { status: 400 });
		}
		
		return json({ error: error.message }, { status: 500 });
	}
}