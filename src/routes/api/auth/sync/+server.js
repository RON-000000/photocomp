import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/db.js';
import { generateId } from '$lib/server/models.js';
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
		let isNewUser = false;

		if (!user) {
			isNewUser = true;

			// Generate unique username (username is already sanitized from frontend)
			let uniqueUsername = username;
			let counter = 1;

			// Check if username is already taken
			while (await users.findOne({ username: uniqueUsername })) {
				// Append counter to make it unique
				uniqueUsername = `${username}${counter}`;
				counter++;
			}

			// Create new user with profileCompleted = false
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
				profileCompleted: false, // New users need to complete profile
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

		return json({
			...safeUser,
			isNewUser
		});
	} catch (error) {
		console.error('User sync error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}