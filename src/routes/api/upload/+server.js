import { json } from '@sveltejs/kit';
import { validateAndProcessImage } from '$lib/server/imageProcessor.js';
import { uploadImage } from '$lib/server/cloudinary.js';

export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('image');
		
		if (!file) {
			return json({ error: 'No image provided' }, { status: 400 });
		}
		
		// Validate and compress image
		const compressedBuffer = await validateAndProcessImage(file);
		
		// Upload to Cloudinary
		const imageUrl = await uploadImage(compressedBuffer, 'submissions');
		
		return json({ 
			success: true, 
			imageUrl,
			message: 'Image uploaded successfully'
		});
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}