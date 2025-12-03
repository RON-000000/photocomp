import { json } from '@sveltejs/kit';
import { addVoteWithUser } from '$lib/server/models.js';

export async function POST({ params, request }) {
	try {
		const { userId } = await request.json();

		if (!userId) {
			return json({ error: 'User ID erforderlich' }, { status: 400 });
		}

		await addVoteWithUser(params.id, userId);

		return json({ success: true, message: 'Vote erfolgreich hinzugefügt' });
	} catch (error) {
		console.error('Vote error:', error);
		return json({ error: error.message }, { status: 400 });
	}
}
