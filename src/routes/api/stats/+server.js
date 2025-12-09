import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/db.js';

export async function GET() {
    try {
        const users = await getCollection('users');
        const competitions = await getCollection('competitions');
        const submissions = await getCollection('submissions');

        const totalUsers = await users.countDocuments();
        const totalCompetitions = await competitions.countDocuments();
        const totalSubmissions = await submissions.countDocuments();

        return json({
            photographers: totalUsers,
            competitions: totalCompetitions,
            photos: totalSubmissions
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        return json({
            photographers: 0,
            competitions: 0,
            photos: 0
        });
    }
}
