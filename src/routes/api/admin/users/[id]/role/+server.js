import { json } from '@sveltejs/kit';
import { updateUserRole } from '$lib/server/models.js';
import { requireRole } from '$lib/server/auth.js';
import { UserRoleUpdateSchema, validateOrThrow } from '$lib/server/validation.js';

export async function POST(event) {
	try {
		// Require admin role
		await requireRole(event, 'admin');

		const roleData = await event.request.json();
		const userId = event.params.id;

		// Validate with Zod schema
		const validated = validateOrThrow(UserRoleUpdateSchema, roleData);

		const updatedUser = await updateUserRole(userId, validated.role);
		return json(updatedUser);
	} catch (error) {
		console.error('Update role error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
