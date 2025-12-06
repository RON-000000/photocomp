import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth.js';
import { deleteImage } from '$lib/server/cloudinary.js';

export async function POST(event) {
	try {
		// Require authentication
		await requireAuth(event);

		const { imageUrl } = await event.request.json();

		if (!imageUrl) {
			return json({ error: 'Image URL ist erforderlich' }, { status: 400 });
		}

		// Delete image from Cloudinary
		const success = await deleteImage(imageUrl);

		if (success) {
			return json({ success: true, message: 'Bild erfolgreich gelöscht' });
		} else {
			return json({ error: 'Bild konnte nicht gelöscht werden' }, { status: 500 });
		}
	} catch (error) {
		console.error('Delete image error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
