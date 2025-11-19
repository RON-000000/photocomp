import sharp from 'sharp';

/**
 * Compress and resize image
 * Max 5MB, auto-compress to fit
 * @param {Buffer} buffer - Original image buffer
 * @returns {Promise<Buffer>} - Compressed image buffer
 */
export async function compressImage(buffer) {
	const MAX_SIZE_MB = 5;
	const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
	
	// Get image metadata
	const metadata = await sharp(buffer).metadata();
	
	// Start with high quality
	let quality = 90;
	let compressed = buffer;
	
	// Resize if too large
	let image = sharp(buffer);
	
	if (metadata.width > 2400 || metadata.height > 2400) {
		image = image.resize(2400, 2400, {
			fit: 'inside',
			withoutEnlargement: true
		});
	}
	
	// Compress until under 5MB
	while (quality > 10) {
		compressed = await image
			.jpeg({ quality, mozjpeg: true })
			.toBuffer();
		
		if (compressed.length <= MAX_SIZE_BYTES) {
			break;
		}
		
		quality -= 10;
	}
	
	console.log(`Image compressed: ${(buffer.length / 1024 / 1024).toFixed(2)}MB → ${(compressed.length / 1024 / 1024).toFixed(2)}MB (Quality: ${quality})`);
	
	return compressed;
}

/**
 * Validate image file
 * @param {File} file - File object
 * @returns {Promise<Buffer>} - File buffer
 */
export async function validateAndProcessImage(file) {
	const MAX_SIZE_MB = 10; // Allow up to 10MB upload (will be compressed to 5MB)
	const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	
	// Check file type
	if (!ALLOWED_TYPES.includes(file.type)) {
		throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
	}
	
	// Check file size
	if (file.size > MAX_SIZE_MB * 1024 * 1024) {
		throw new Error(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
	}
	
	// Convert to buffer
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	
	// Compress
	return await compressImage(buffer);
}