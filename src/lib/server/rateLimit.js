import { error } from '@sveltejs/kit';

/**
 * Simple in-memory rate limiting
 * For production, consider using Redis or another persistent store
 */

// Store for tracking requests: Map<key, {count: number, resetAt: number}>
const requestStore = new Map();

// Cleanup old entries every 10 minutes
setInterval(() => {
	const now = Date.now();
	for (const [key, data] of requestStore.entries()) {
		if (data.resetAt < now) {
			requestStore.delete(key);
		}
	}
}, 10 * 60 * 1000);

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
	// Strict - for authentication, voting, sensitive operations
	STRICT: {
		maxRequests: 5,
		windowMs: 60 * 1000 // 1 minute
	},

	// Moderate - for submissions, comments
	MODERATE: {
		maxRequests: 10,
		windowMs: 60 * 1000 // 1 minute
	},

	// Relaxed - for general API endpoints
	RELAXED: {
		maxRequests: 30,
		windowMs: 60 * 1000 // 1 minute
	},

	// Custom upload limit
	UPLOAD: {
		maxRequests: 3,
		windowMs: 60 * 1000 // 1 minute
	}
};

/**
 * Create a rate limiter with custom configuration
 * @param {Object} config - Rate limit configuration
 * @param {number} config.maxRequests - Maximum requests allowed in window
 * @param {number} config.windowMs - Time window in milliseconds
 * @returns {Function} Rate limit middleware function
 */
export function createRateLimiter(config = RateLimitPresets.RELAXED) {
	const { maxRequests, windowMs } = config;

	return async (event) => {
		// Get identifier (IP address or user ID if authenticated)
		const identifier = getIdentifier(event);

		const now = Date.now();
		const key = `${identifier}:${event.route.id}`;

		// Get or create request data
		let requestData = requestStore.get(key);

		if (!requestData || requestData.resetAt < now) {
			// Create new window
			requestData = {
				count: 1,
				resetAt: now + windowMs
			};
			requestStore.set(key, requestData);
			return;
		}

		// Increment counter
		requestData.count++;

		// Check if limit exceeded
		if (requestData.count > maxRequests) {
			const resetInSeconds = Math.ceil((requestData.resetAt - now) / 1000);
			throw error(429, `Zu viele Anfragen. Bitte versuche es in ${resetInSeconds} Sekunden erneut.`);
		}
	};
}

/**
 * Get unique identifier for rate limiting
 * Prefers user ID if authenticated, falls back to IP address
 * @param {Object} event - SvelteKit event object
 * @returns {string} Unique identifier
 */
function getIdentifier(event) {
	// Prefer authenticated user ID
	if (event.locals.user?._id) {
		return `user:${event.locals.user._id}`;
	}

	// Fall back to IP address
	const forwarded = event.request.headers.get('x-forwarded-for');
	const ip = forwarded ? forwarded.split(',')[0].trim() :
	           event.getClientAddress();

	return `ip:${ip}`;
}

/**
 * Rate limiter wrapper for easy use in endpoints
 * @param {Function} handler - Endpoint handler function
 * @param {Object} config - Rate limit configuration (optional)
 * @returns {Function} Wrapped handler with rate limiting
 */
export function withRateLimit(handler, config) {
	const rateLimiter = createRateLimiter(config);

	return async (event) => {
		await rateLimiter(event);
		return handler(event);
	};
}
