import { json } from '@sveltejs/kit';
import { validateAndProcessImage } from '$lib/server/imageProcessor.js';
import { uploadImage } from '$lib/server/cloudinary.js';
import { requireAuth } from '$lib/server/auth.js';
import { createRateLimiter, RateLimitPresets } from '$lib/server/rateLimit.js';
import { ImageUploadSchema, validateOrThrow } from '$lib/server/validation.js';

const rateLimiter = createRateLimiter(RateLimitPresets.UPLOAD);

export async function POST(event) {
	try {
		// Apply rate limiting (3 uploads per minute)
		await rateLimiter(event);

		// Require authentication
		await requireAuth(event);

		const formData = await event.request.formData();
		const file = formData.get('image');
		const folder = formData.get('folder') || 'submissions';

		if (!file) {
			return json({ error: 'No image provided' }, { status: 400 });
		}

		// Validate file with Zod schema
		validateOrThrow(ImageUploadSchema, {
			size: file.size,
			type: file.type,
			name: file.name
		});

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
		return json({ error: error.message }, { status: error.status || 500 });
	}
}