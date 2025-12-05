import { error } from '@sveltejs/kit';

/**
 * Simple session-based auth for development
 * Uses user data from event.locals set by hooks
 */

/**
 * Get user from event.locals (set by hooks or frontend)
 * @param {object} event - SvelteKit event object
 * @returns {object|null} User object or null
 */
function getUserFromEvent(event) {
	// Check if user is in locals (set by hooks)
	if (event.locals.user) {
		return event.locals.user;
	}

	// Fallback: Check cookies for user session
	const userCookie = event.cookies.get('user');
	if (userCookie) {
		try {
			return JSON.parse(userCookie);
		} catch (err) {
			console.error('Failed to parse user cookie:', err);
		}
	}

	return null;
}

/**
 * Require authentication - check if user is logged in
 * @param {object} event - SvelteKit event object
 * @returns {Promise<object>} User object
 */
export async function requireAuth(event) {
	const user = getUserFromEvent(event);

	if (!user) {
		throw error(401, 'Anmeldung erforderlich');
	}

	return user;
}

/**
 * Require specific role(s) - verify user has required role
 * @param {object} event - SvelteKit event object
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Promise<object>} User object if authorized
 */
export async function requireRole(event, allowedRoles) {
	const user = await requireAuth(event);

	// Normalize to array
	const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

	if (!roles.includes(user.role)) {
		throw error(403, 'Keine Berechtigung für diese Aktion');
	}

	return user;
}

/**
 * Optional auth - return user if authenticated, null otherwise
 * @param {object} event - SvelteKit event object
 * @returns {Promise<object|null>} User object or null
 */
export async function optionalAuth(event) {
	try {
		return await requireAuth(event);
	} catch (err) {
		return null;
	}
}

/**
 * Check if user owns resource (for DELETE/UPDATE operations)
 * @param {object} user - User object
 * @param {string} resourceUserId - User ID from resource (submission, comment, etc.)
 * @returns {boolean} True if user owns resource or is admin
 */
export function checkOwnership(user, resourceUserId) {
	// Admin can access everything
	if (user.role === 'admin') return true;

	// Check if user owns the resource
	return user._id === resourceUserId || user.auth0Id === resourceUserId;
}
