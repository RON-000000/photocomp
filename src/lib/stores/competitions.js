import { writable } from 'svelte/store';
import { mockCompetitions, mockSubmissions } from '$lib/data/mockData';

// Competition Store
export const competitions = writable(mockCompetitions);

// Submissions Store
export const submissions = writable(mockSubmissions);

// Funktion: Vote auf Submission abgeben
export function addCommunityVote(submissionId) {
	submissions.update(subs => {
		return subs.map(sub => {
			if (sub.id === submissionId) {
				return {
					...sub,
					votes: {
						...sub.votes,
						community: sub.votes.community + 1
					}
				};
			}
			return sub;
		});
	});
}

// Funktion: Kommentar hinzufügen
export function addComment(submissionId, userId, username, text) {
	submissions.update(subs => {
		return subs.map(sub => {
			if (sub.id === submissionId) {
				const newComment = {
					id: `c${Date.now()}`,
					userId,
					username,
					text,
					createdAt: new Date().toISOString()
				};
				return {
					...sub,
					comments: [...sub.comments, newComment]
				};
			}
			return sub;
		});
	});
}

// Funktion: Neue Submission hinzufügen
export function addSubmission(competitionId, userId, title, description, imageUrl, metadata) {
	const newSubmission = {
		id: `sub${Date.now()}`,
		competitionId,
		userId,
		title,
		description,
		imageUrl,
		createdAt: new Date().toISOString(),
		votes: {
			community: 0,
			jury: 0
		},
		comments: [],
		metadata: metadata || {}
	};

	submissions.update(subs => [...subs, newSubmission]);
	
	// Update Competition Submission Count
	competitions.update(comps => {
		return comps.map(comp => {
			if (comp.id === competitionId) {
				return {
					...comp,
					submissionCount: comp.submissionCount + 1
				};
			}
			return comp;
		});
	});
}