import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/db.js';

export async function GET({ url }) {
	try {
		const username = url.searchParams.get('username');

		if (!username) {
			return json({ error: 'Username is required' }, { status: 400 });
		}

		// Normalize username
		const normalizedUsername = username.toLowerCase().trim();

		// Validate format
		if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
			return json({
				available: false,
				error: 'Invalid username format'
			});
		}

		if (normalizedUsername.length < 3) {
			return json({
				available: false,
				error: 'Username must be at least 3 characters'
			});
		}

		if (normalizedUsername.length > 30) {
			return json({
				available: false,
				error: 'Username must be at most 30 characters'
			});
		}

		// Reserved usernames
		const reserved = ['admin', 'administrator', 'mod', 'moderator', 'system', 'photocomp', 'support', 'help', 'api', 'www', 'mail', 'email'];
		if (reserved.includes(normalizedUsername)) {
			return json({
				available: false,
				error: 'This username is reserved'
			});
		}

		const users = await getCollection('users');
		const existingUser = await users.findOne({ username: normalizedUsername });

		return json({
			available: !existingUser,
			username: normalizedUsername
		});
	} catch (error) {
		console.error('Error checking username:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
}
