import { json } from '@sveltejs/kit';
import { getSubmissionById, getCompetitionById } from '$lib/server/models.js';
import { getCollection } from '$lib/server/db.js';

export async function DELETE({ params, request }) {
	try {
		const { userId } = await request.json();
		
		// Hole Submission
		const submission = await getSubmissionById(params.id);
		if (!submission) {
			return json({ error: 'Submission nicht gefunden' }, { status: 404 });
		}
		
		// Check ob User der Owner ist
		if (submission.userId !== userId) {
			return json({ error: 'Keine Berechtigung' }, { status: 403 });
		}
		
		// Hole Competition um Status zu prüfen
		const competition = await getCompetitionById(submission.competitionId);
		if (!competition) {
			return json({ error: 'Wettbewerb nicht gefunden' }, { status: 404 });
		}
		
		// Check ob Competition im Voting oder beendet ist
		if (competition.status === 'voting' || competition.status === 'completed') {
			return json({ 
				error: 'Submissions können während der Voting-Phase und danach nicht gelöscht werden' 
			}, { status: 403 });
		}
		
		// Lösche Submission
		const submissions = await getCollection('submissions');
		await submissions.deleteOne({ _id: params.id });
		
		// Update Competition Stats
		const competitions = await getCollection('competitions');
		await competitions.updateOne(
			{ _id: submission.competitionId },
			{ $inc: { submissionCount: -1 } }
		);
		
		return json({ 
			success: true,
			message: 'Submission erfolgreich gelöscht' 
		});
	} catch (error) {
		console.error('Delete submission error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}