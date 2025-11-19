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