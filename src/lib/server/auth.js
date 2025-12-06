import { error } from '@sveltejs/kit';
import { getCollection } from './db.js';

/**
 * Secure session-based auth
 * Cookie is only used as a hint for auth0Id, actual user data (including role)
 * is always loaded from database to prevent cookie manipulation attacks.
 */

/**
 * Get auth0Id from cookie or event.locals (for quick checks)
 * @param {object} event - SvelteKit event object
 * @returns {string|null} auth0Id or null
 */
function getAuth0IdFromEvent(event) {
	// Check if user is in locals (set by hooks)
	if (event.locals.user?.auth0Id) {
		return event.locals.user.auth0Id;
	}
	return null;
}

/**
 * Load user from database by auth0Id
 * This ensures we always have the verified role from the database
 * @param {string} auth0Id - Auth0 user ID
 * @returns {Promise<object|null>} User object or null
 */
async function getUserFromDatabase(auth0Id) {
	if (!auth0Id) return null;

	try {
		const users = await getCollection('users');
		const user = await users.findOne({ auth0Id });
		return user;
	} catch (err) {
		console.error('Database lookup failed:', err);
		return null;
	}
}

/**
 * Require authentication - check if user is logged in
 * IMPORTANT: Always loads user from DB to verify role (prevents cookie manipulation)
 * @param {object} event - SvelteKit event object
 * @returns {Promise<object>} User object from database
 */
export async function requireAuth(event) {
	const auth0Id = getAuth0IdFromEvent(event);

	if (!auth0Id) {
		throw error(401, 'Anmeldung erforderlich');
	}

	// Always load from database to get verified role
	const user = await getUserFromDatabase(auth0Id);

	if (!user) {
		throw error(401, 'Benutzer nicht gefunden');
	}

	// Update event.locals with verified user data
	event.locals.user = user;

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
