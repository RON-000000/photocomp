import { json } from '@sveltejs/kit';
import { seedMockData } from '$lib/server/models.js';

export async function POST() {
	try {
		const result = await seedMockData();
		return json(result);
	} catch (error) {
		console.error('Seed error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}