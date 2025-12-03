import { json } from '@sveltejs/kit';
import { addComment } from '$lib/server/models.js';

export async function POST({ params, request }) {
	try {
		const commentData = await request.json();

		if (!commentData.userId || !commentData.username || !commentData.text) {
			return json({ error: 'Alle Felder sind erforderlich' }, { status: 400 });
		}

		if (commentData.text.trim().length === 0) {
			return json({ error: 'Kommentar darf nicht leer sein' }, { status: 400 });
		}

		const comment = await addComment(params.id, commentData);

		return json({ success: true, comment });
	} catch (error) {
		console.error('Comment error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
