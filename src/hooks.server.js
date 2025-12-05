/**
 * SvelteKit Server Hooks
 * Handles authentication state and CORS for server-side requests
 */

// CORS Configuration
const CORS_CONFIG = {
	// Production: Nur deine eigene Domain erlauben
	// Development: localhost erlauben
	allowedOrigins: [
		'http://localhost:5173',
		'http://localhost:4173',
		'https://photozurich.ch', // Ersetze mit deiner Production Domain
		// Füge weitere erlaubte Domains hinzu
	],
	allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	maxAge: 86400 // 24 hours
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Check for user cookie (set by frontend after Auth0 login)
	const userCookie = event.cookies.get('user');

	if (userCookie) {
		try {
			const user = JSON.parse(userCookie);
			event.locals.user = user;
		} catch (err) {
			console.error('Failed to parse user cookie:', err);
			// Clear invalid cookie
			event.cookies.delete('user', { path: '/' });
		}
	}

	// Handle CORS
	const origin = event.request.headers.get('origin');

	// Handle preflight requests (OPTIONS)
	if (event.request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: getCorsHeaders(origin)
		});
	}

	const response = await resolve(event);

	// Add CORS headers to all responses
	const corsHeaders = getCorsHeaders(origin);
	Object.entries(corsHeaders).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return response;
}

/**
 * Get CORS headers based on request origin
 * @param {string|null} origin - Request origin
 * @returns {Object} CORS headers
 */
function getCorsHeaders(origin) {
	const headers = {};

	// Check if origin is allowed
	if (origin && CORS_CONFIG.allowedOrigins.includes(origin)) {
		headers['Access-Control-Allow-Origin'] = origin;
	} else if (!origin) {
		// Same-origin request (no origin header)
		// Allow it by not setting CORS headers
		return headers;
	}

	headers['Access-Control-Allow-Methods'] = CORS_CONFIG.allowedMethods.join(', ');
	headers['Access-Control-Allow-Headers'] = CORS_CONFIG.allowedHeaders.join(', ');
	headers['Access-Control-Max-Age'] = CORS_CONFIG.maxAge.toString();

	if (CORS_CONFIG.credentials) {
		headers['Access-Control-Allow-Credentials'] = 'true';
	}

	return headers;
}
