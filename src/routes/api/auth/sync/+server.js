import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/db.js';
import { UserSyncSchema, validateOrThrow } from '$lib/server/validation.js';
import { createRateLimiter, RateLimitPresets } from '$lib/server/rateLimit.js';

const rateLimiter = createRateLimiter(RateLimitPresets.STRICT);

export async function POST(event) {
	try {
		// Apply rate limiting
		await rateLimiter(event);

		const userData = await event.request.json();

		// Validate with Zod schema
		const validated = validateOrThrow(UserSyncSchema, userData);

		const { auth0Id, email, name, avatar, username } = validated;
		
		const users = await getCollection('users');
		
		// Check if user exists
		let user = await users.findOne({ auth0Id });
		
		if (!user) {
			// Generate unique username
			let uniqueUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
			let counter = 1;
			
			while (await users.findOne({ username: uniqueUsername })) {
				uniqueUsername = `${username}${counter}`;
				counter++;
			}
			
			// Create new user
			const newUser = {
				_id: generateId(),
				auth0Id,
				username: uniqueUsername,
				email,
				name,
				avatar,
				bio: '',
				location: 'Zürich, Schweiz',
				website: '',
				role: 'user', // Default role
				stats: {
					submissions: 0,
					wins: 0,
					totalVotes: 0
				},
				createdAt: new Date().toISOString()
			};
			
			await users.insertOne(newUser);
			user = newUser;
		} else {
			// Update existing user - only update email, keep user's custom name and avatar
			await users.updateOne(
				{ auth0Id },
				{
					$set: {
						email
					}
				}
			);

			user = await users.findOne({ auth0Id });
		}
		
		// Remove sensitive data
		const { password, ...safeUser } = user;
		
		return json(safeUser);
	} catch (error) {
		console.error('User sync error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

function generateId() {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}