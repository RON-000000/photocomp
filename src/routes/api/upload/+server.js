import { json } from '@sveltejs/kit';
import { validateAndProcessImage } from '$lib/server/imageProcessor.js';
import { uploadImage } from '$lib/server/cloudinary.js';

export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('image');
		const folder = formData.get('folder') || 'submissions';

		if (!file) {
			return json({ error: 'No image provided' }, { status: 400 });
		}

		// Validate and compress image
		const compressedBuffer = await validateAndProcessImage(file);

		// Upload to Cloudinary with specified folder
		const imageUrl = await uploadImage(compressedBuffer, folder);

		return json({
			success: true,
			url: imageUrl,
			imageUrl,
			message: 'Image uploaded successfully'
		});
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}