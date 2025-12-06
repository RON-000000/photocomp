import { v2 as cloudinary } from 'cloudinary';
import { 
	CLOUDINARY_CLOUD_NAME, 
	CLOUDINARY_API_KEY, 
	CLOUDINARY_API_SECRET 
} from '$env/static/private';

cloudinary.config({
	cloud_name: CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET
});

export default cloudinary;

/**
 * Upload image to Cloudinary using unsigned upload preset
 * @param {Buffer} fileBuffer - Image buffer
 * @param {string} folder - Cloudinary folder (e.g. 'submissions', 'profiles')
 * @returns {Promise<string>} - Cloudinary URL
 */
export async function uploadImage(fileBuffer, folder = 'submissions') {
	return new Promise((resolve, reject) => {
		// Convert buffer to base64 data URI
		const base64String = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

		// Use unsigned upload with the preset you just created
		cloudinary.uploader.unsigned_upload(
			base64String,
			'photozurich_unsigned', // Your upload preset name
			{
				folder: `photozurich/${folder}`,
				resource_type: 'image'
			},
			(error, result) => {
				if (error) {
					console.error('Cloudinary upload error:', error);
					reject(error);
				} else {
					console.log('✅ Upload successful:', result.secure_url);
					resolve(result.secure_url);
				}
			}
		);
	});
}

/**
 * Extract public_id from Cloudinary URL
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {string|null} - Public ID or null if invalid
 */
export function extractPublicId(imageUrl) {
	if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
		console.warn('Invalid Cloudinary URL:', imageUrl);
		return null;
	}

	try {
		// Example URL: https://res.cloudinary.com/drhonsrxg/image/upload/v1764980982/photozurich/competitions/lxpfgzsaysap2ld3ufqj.jpg
		// Public ID: photozurich/competitions/lxpfgzsaysap2ld3ufqj
		const parts = imageUrl.split('/upload/');
		if (parts.length < 2) {
			console.warn('URL does not contain /upload/:', imageUrl);
			return null;
		}

		const pathParts = parts[1].split('/');
		console.log('   Path parts:', pathParts);

		// Remove version (v1234567890) if present
		const startIndex = pathParts[0].startsWith('v') ? 1 : 0;
		console.log('   Start index (skip version):', startIndex);

		// Join folder and filename without extension
		const publicIdWithExt = pathParts.slice(startIndex).join('/');
		console.log('   Public ID with extension:', publicIdWithExt);

		// Remove file extension
		const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
		console.log('   Final public ID:', publicId);

		return publicId;
	} catch (error) {
		console.error('Error extracting public_id:', error);
		return null;
	}
}

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Cloudinary URL to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteImage(imageUrl) {
	const publicId = extractPublicId(imageUrl);

	if (!publicId) {
		console.warn('Could not extract public_id from URL:', imageUrl);
		console.warn('Original URL was:', imageUrl);
		return false;
	}

	console.log('🗑️ Attempting to delete image from Cloudinary...');
	console.log('   URL:', imageUrl);
	console.log('   Public ID:', publicId);

	try {
		const result = await cloudinary.uploader.destroy(publicId, {
			invalidate: true // Invalidate CDN cache
		});

		console.log('   Cloudinary response:', JSON.stringify(result, null, 2));

		if (result.result === 'ok') {
			console.log('✅ Image deleted from Cloudinary:', publicId);
			return true;
		} else if (result.result === 'not found') {
			console.warn('⚠️ Image not found on Cloudinary (already deleted?):', publicId);
			return true; // Consider it a success if already gone
		} else {
			console.warn('⚠️ Failed to delete image. Result:', result);
			return false;
		}
	} catch (error) {
		console.error('❌ Error deleting image from Cloudinary:', error);
		console.error('   Error details:', error.message);
		console.error('   Stack:', error.stack);
		return false;
	}
}

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} imageUrls - Array of Cloudinary URLs
 * @returns {Promise<number>} - Number of successfully deleted images
 */
export async function deleteImages(imageUrls) {
	if (!imageUrls || imageUrls.length === 0) {
		return 0;
	}

	const deletePromises = imageUrls
		.filter(url => url && url.includes('cloudinary.com'))
		.map(url => deleteImage(url));

	const results = await Promise.all(deletePromises);
	const successCount = results.filter(r => r === true).length;

	console.log(`🗑️ Deleted ${successCount}/${imageUrls.length} images from Cloudinary`);
	return successCount;
}