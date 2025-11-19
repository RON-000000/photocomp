// Mock Users
export const mockUsers = [
	{
		id: '1',
		username: 'anna_photos',
		name: 'Anna Mueller',
		avatar: 'https://i.pravatar.cc/150?img=1',
		bio: 'Street Photography aus Zürich 📸',
		location: 'Zürich',
		memberSince: '2024-01-15',
		stats: {
			submissions: 12,
			wins: 3,
			votes: 145
		},
		portfolio: [
			{
				id: 'p1',
				imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
				title: 'Zürich Sunset',
				description: 'Sonnenuntergang über der Limmat'
			},
			{
				id: 'p2',
				imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
				title: 'Tram Lines',
				description: 'Geometrie der Stadt'
			}
		]
	},
	{
		id: '2',
		username: 'max_lens',
		name: 'Max Berger',
		avatar: 'https://i.pravatar.cc/150?img=2',
		bio: 'Landschaftsfotograf | Zürich & Umgebung',
		location: 'Zürich',
		memberSince: '2023-11-20',
		stats: {
			submissions: 8,
			wins: 1,
			votes: 89
		},
		portfolio: [
			{
				id: 'p3',
				imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
				title: 'Uetliberg View',
				description: 'Blick über Zürich'
			}
		]
	},
	{
		id: '3',
		username: 'sarah_captures',
		name: 'Sarah Fischer',
		avatar: 'https://i.pravatar.cc/150?img=3',
		bio: 'Portrait & Urban Photography',
		location: 'Zürich',
		memberSince: '2024-02-10',
		stats: {
			submissions: 15,
			wins: 5,
			votes: 210
		},
		portfolio: [
			{
				id: 'p4',
				imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
				title: 'City Lights',
				description: 'Nachtleben in Zürich'
			},
			{
				id: 'p5',
				imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
				title: 'Architecture',
				description: 'Moderne Architektur'
			}
		]
	}
];

// Mock Competitions
export const mockCompetitions = [
	{
		id: '1',
		title: 'Zürich bei Nacht',
		description: 'Zeigt die Schönheit von Zürich nach Sonnenuntergang. Langzeitbelichtungen, Neonlichter, Stadtleben – alles ist erlaubt!',
		theme: 'Nachtfotografie',
		status: 'active', // active, voting, completed
		deadline: '2024-12-31',
		startDate: '2024-11-01',
		imageUrl: 'https://images.unsplash.com/photo-1517639493569-5666a7b2f494?w=800',
		prizes: [
			'1. Platz: CHF 200 Gutschein Foto Zumstein',
			'2. Platz: Feature auf Instagram',
			'3. Platz: PhotoZürich Badge'
		],
		rules: [
			'Max. 3 Submissions pro Person',
			'Fotos müssen in Zürich aufgenommen sein',
			'Bearbeitung erlaubt, aber authentisch'
		],
		juryMembers: ['sarah_captures', 'max_lens'],
		participantCount: 45,
		submissionCount: 87,
		votingWeight: {
			community: 0.6,
			jury: 0.4
		}
	},
	{
		id: '2',
		title: 'Street Life',
		description: 'Einfängt die Menschen, Momente und Geschichten der Zürcher Strassen.',
		theme: 'Street Photography',
		status: 'voting',
		deadline: '2024-11-20',
		startDate: '2024-10-15',
		imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
		prizes: [
			'1. Platz: Workshop mit Pro-Fotograf',
			'2. Platz: CHF 100 Gutschein',
			'3. Platz: Feature'
		],
		rules: [
			'Nur Schwarzweiss',
			'Menschen müssen im Fokus sein',
			'Candid Shots bevorzugt'
		],
		juryMembers: ['anna_photos'],
		participantCount: 32,
		submissionCount: 65,
		votingWeight: {
			community: 0.5,
			jury: 0.5
		}
	},
	{
		id: '3',
		title: 'Herbstfarben',
		description: 'Die goldenen Farben des Herbstes in und um Zürich.',
		theme: 'Landschaft',
		status: 'completed',
		deadline: '2024-10-31',
		startDate: '2024-09-15',
		imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
		prizes: [
			'1. Platz: CHF 150 Gutschein',
			'2. Platz: Feature',
			'3. Platz: Badge'
		],
		rules: [
			'Muss im Herbst 2024 aufgenommen sein',
			'Zürich oder 50km Radius'
		],
		juryMembers: ['max_lens', 'sarah_captures'],
		participantCount: 28,
		submissionCount: 52,
		votingWeight: {
			community: 0.7,
			jury: 0.3
		},
		winners: {
			first: '6',
			second: '7',
			third: '8'
		}
	}
];

// Mock Submissions
export const mockSubmissions = [
	{
		id: '1',
		competitionId: '1',
		userId: '1',
		title: 'Limmat Reflections',
		description: 'Langzeitbelichtung der Limmat mit Spiegelungen der Stadtlichter',
		imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
		createdAt: '2024-11-10',
		votes: {
			community: 42,
			jury: 8.5
		},
		comments: [
			{
				id: 'c1',
				userId: '2',
				username: 'max_lens',
				text: 'Wow! Die Farben sind atemberaubend. Wie lange war die Belichtungszeit?',
				createdAt: '2024-11-11'
			},
			{
				id: 'c2',
				userId: '3',
				username: 'sarah_captures',
				text: 'Schöne Komposition! Der Vordergrund könnte etwas schärfer sein.',
				createdAt: '2024-11-12'
			}
		],
		metadata: {
			camera: 'Sony A7III',
			lens: '24-70mm f/2.8',
			settings: 'f/11, 30s, ISO 100'
		}
	},
	{
		id: '2',
		competitionId: '1',
		userId: '2',
		title: 'Grossmünster bei Vollmond',
		description: 'Die ikonischen Türme des Grossmünsters unter dem Vollmond',
		imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
		createdAt: '2024-11-12',
		votes: {
			community: 38,
			jury: 9.0
		},
		comments: [],
		metadata: {
			camera: 'Canon EOS R5',
			lens: '70-200mm f/2.8',
			settings: 'f/5.6, 4s, ISO 400'
		}
	},
	{
		id: '3',
		competitionId: '2',
		userId: '3',
		title: 'Tram Stop Encounter',
		description: 'Zwei Fremde warten auf das Tram - ein kurzer Moment der Stille',
		imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
		createdAt: '2024-10-20',
		votes: {
			community: 56,
			jury: 8.8
		},
		comments: [
			{
				id: 'c3',
				userId: '1',
				username: 'anna_photos',
				text: 'Perfect street moment! Die S/W Konvertierung ist klasse.',
				createdAt: '2024-10-21'
			}
		],
		metadata: {
			camera: 'Fujifilm X-T4',
			lens: '35mm f/1.4',
			settings: 'f/2.8, 1/125s, ISO 800'
		}
	},
	{
		id: '4',
		competitionId: '1',
		userId: '3',
		title: 'Bahnhofstrasse Lights',
		description: 'Das pulsierende Herz von Zürich bei Nacht',
		imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
		createdAt: '2024-11-13',
		votes: {
			community: 51,
			jury: 7.8
		},
		comments: [],
		metadata: {
			camera: 'Nikon Z6',
			lens: '35mm f/1.8',
			settings: 'f/2.0, 1/60s, ISO 1600'
		}
	},
	{
		id: '5',
		competitionId: '2',
		userId: '1',
		title: 'Morning Commute',
		description: 'Der tägliche Weg zur Arbeit',
		imageUrl: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=800',
		createdAt: '2024-10-18',
		votes: {
			community: 44,
			jury: 8.2
		},
		comments: [],
		metadata: {
			camera: 'Leica Q2',
			lens: '28mm f/1.7',
			settings: 'f/2.8, 1/250s, ISO 400'
		}
	},
	// Submissions für completed competition
	{
		id: '6',
		competitionId: '3',
		userId: '2',
		title: 'Golden Hour at Zürichsee',
		description: 'Herbstliche Stimmung am See',
		imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
		createdAt: '2024-10-20',
		votes: {
			community: 78,
			jury: 9.5
		},
		comments: [],
		metadata: {
			camera: 'Canon EOS R5',
			lens: '70-200mm f/2.8',
			settings: 'f/5.6, 1/500s, ISO 200'
		}
	},
	{
		id: '7',
		competitionId: '3',
		userId: '3',
		title: 'Forest Path',
		description: 'Herbstlicher Waldweg im Zürichberg',
		imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
		createdAt: '2024-10-22',
		votes: {
			community: 65,
			jury: 8.9
		},
		comments: [],
		metadata: {
			camera: 'Sony A7IV',
			lens: '24-105mm f/4',
			settings: 'f/8, 1/125s, ISO 400'
		}
	},
	{
		id: '8',
		competitionId: '3',
		userId: '1',
		title: 'Autumn Colors',
		description: 'Bunte Blätter im Stadtpark',
		imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
		createdAt: '2024-10-25',
		votes: {
			community: 59,
			jury: 8.4
		},
		comments: [],
		metadata: {
			camera: 'Fujifilm X-T4',
			lens: '56mm f/1.2',
			settings: 'f/2.8, 1/250s, ISO 200'
		}
	}
];

// Helper Functions
export function getCompetitionById(id) {
	return mockCompetitions.find(c => c.id === id);
}

export function getSubmissionsByCompetitionId(competitionId) {
	return mockSubmissions.filter(s => s.competitionId === competitionId);
}

export function getUserById(id) {
	return mockUsers.find(u => u.id === id);
}

export function getUserByUsername(username) {
	return mockUsers.find(u => u.username === username);
}

export function getSubmissionById(id) {
	return mockSubmissions.find(s => s.id === id);
}

export function calculateTotalScore(submission, competition) {
	const { community, jury } = submission.votes;
	const { votingWeight } = competition;
	
	// Normalisiere Community Votes (angenommen max 100 Votes = 10 Punkte)
	const normalizedCommunity = (community / 100) * 10;
	
	return (normalizedCommunity * votingWeight.community) + (jury * votingWeight.jury);
}

export function getLeaderboard(competitionId) {
	const competition = getCompetitionById(competitionId);
	const submissions = getSubmissionsByCompetitionId(competitionId);
	
	return submissions
		.map(submission => ({
			...submission,
			totalScore: calculateTotalScore(submission, competition),
			user: getUserById(submission.userId)
		}))
		.sort((a, b) => b.totalScore - a.totalScore);
}

export function getActiveCompetitions() {
	return mockCompetitions.filter(c => c.status === 'active' || c.status === 'voting');
}

export function getCompletedCompetitions() {
	return mockCompetitions.filter(c => c.status === 'completed');
}

export function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString('de-CH', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

export function getDaysUntilDeadline(deadline) {
	const now = new Date();
	const deadlineDate = new Date(deadline);
	const diffTime = deadlineDate - now;
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}