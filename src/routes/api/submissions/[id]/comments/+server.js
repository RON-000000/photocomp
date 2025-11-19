import { json } from '@sveltejs/kit';
import { addComment, getSubmissionById } from '$lib/server/models.js';

export async function POST({ params, request }) {
	try {
		const commentData = await request.json();
		
		if (!commentData.userId || !commentData.username || !commentData.text) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}
		
		const comment = await addComment(params.id, commentData);
		
		return json({ 
			success: true, 
			comment 
		});
	} catch (error) {
		console.error('Comment error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}