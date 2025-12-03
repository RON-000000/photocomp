import { json } from '@sveltejs/kit';
import { getJuryMembers } from '$lib/server/models.js';

export async function GET() {
	try {
		const juryMembers = await getJuryMembers();
		return json(juryMembers);
	} catch (error) {
		console.error('Get jury members error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}