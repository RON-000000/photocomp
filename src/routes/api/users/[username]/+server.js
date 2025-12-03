import { json } from '@sveltejs/kit';
import { getUserByUsername, updateUserProfile } from '$lib/server/models.js';

export async function GET({ params }) {
	try {
		const user = await getUserByUsername(params.username);
		return json(user);
	} catch (error) {
		console.error('Get user error:', error);
		return json({ error: error.message }, { status: 404 });
	}
}

export async function PATCH({ params, request }) {
	try {
		const updates = await request.json();
		const user = await getUserByUsername(params.username);
		
		// TODO: Check if user is updating their own profile or is admin
		
		const updatedUser = await updateUserProfile(user._id, updates);
		return json(updatedUser);
	} catch (error) {
		console.error('Update user error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}