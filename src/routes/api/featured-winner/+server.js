import { json } from '@sveltejs/kit';
import { getCompletedCompetitions, getSubmissionsByCompetitionId } from '$lib/server/models.js';

export async function GET() {
    try {
        // Get most recent completed competition
        const completedCompetitions = await getCompletedCompetitions();

        if (!completedCompetitions || completedCompetitions.length === 0) {
            return json({ winners: null, message: 'No completed competitions yet' });
        }

        const latestCompetition = completedCompetitions[0];

        // Get all submissions for this competition
        const submissions = await getSubmissionsByCompetitionId(latestCompetition._id);

        if (!submissions || submissions.length === 0) {
            return json({ winners: null, message: 'No submissions in latest competition' });
        }

        // Calculate total score for all submissions
        const votingWeight = latestCompetition.votingWeight || { community: 0.6, jury: 0.4 };

        const scoredSubmissions = submissions.map(sub => {
            // Normalize community votes (assume max 100 votes = 10 points)
            const communityScore = Math.min((sub.votes?.community || 0) / 10, 10);
            const juryScore = sub.votes?.jury || 0;

            const totalScore = (communityScore * votingWeight.community) +
                (juryScore * votingWeight.jury);

            return {
                ...sub,
                totalScore
            };
        });

        // Sort by total score descending and get top 3
        scoredSubmissions.sort((a, b) => b.totalScore - a.totalScore);
        const topThree = scoredSubmissions.slice(0, 3);

        // Format winners for response
        const winners = topThree.map((winner, index) => ({
            rank: index + 1,
            submission: {
                _id: winner._id,
                title: winner.title,
                imageUrl: winner.imageUrl,
                totalScore: winner.totalScore,
                votes: winner.votes
            },
            user: winner.user
        }));

        return json({
            winners,
            competition: {
                _id: latestCompetition._id,
                title: latestCompetition.title,
                theme: latestCompetition.theme
            }
        });

    } catch (error) {
        console.error('Error fetching featured winners:', error);
        return json({ error: 'Failed to fetch featured winners' }, { status: 500 });
    }
}
