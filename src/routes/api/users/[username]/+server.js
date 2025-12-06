import { json } from '@sveltejs/kit';
import { getUserByUsername, updateUserProfile } from '$lib/server/models.js';
import { requireAuth, checkOwnership } from '$lib/server/auth.js';
import { deleteImage } from '$lib/server/cloudinary.js';

export async function GET({ params }) {
	try {
		const user = await getUserByUsername(params.username);
		return json(user);
	} catch (error) {
		console.error('Get user error:', error);
		return json({ error: error.message }, { status: 404 });
	}
}

export async function PATCH(event) {
	try {
		const updates = await event.request.json();
		const user = await getUserByUsername(event.params.username);

		// Require authentication
		const authUser = await requireAuth(event);

		// Check if user is updating their own profile or is admin
		if (!checkOwnership(authUser, user._id)) {
			return json({ error: 'Keine Berechtigung' }, { status: 403 });
		}

		// If avatar is being updated, delete old avatar from Cloudinary
		if (updates.avatar && user.avatar && updates.avatar !== user.avatar) {
			await deleteImage(user.avatar);
		}

		const updatedUser = await updateUserProfile(user._id, updates);
		return json(updatedUser);
	} catch (error) {
		console.error('Update user error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}