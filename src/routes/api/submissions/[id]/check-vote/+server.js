import { json } from '@sveltejs/kit';
import { hasUserVoted } from '$lib/server/models.js';

export async function POST({ params, request }) {
	try {
		const { userId } = await request.json();
		
		if (!userId) {
			return json({ hasVoted: false });
		}
		
		const hasVoted = await hasUserVoted(params.id, userId);
		
		return json({ hasVoted });
	} catch (error) {
		console.error('Check vote error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}