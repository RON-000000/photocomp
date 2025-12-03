// Seed Data für MongoDB

export const seedUsers = [
	{
		_id: 'user_1',
		auth0Id: 'auth0|mock1',
		username: 'anna_photos',
		name: 'Anna Mueller',
		email: 'anna@example.com',
		avatar: 'https://i.pravatar.cc/150?img=1',
		bio: 'Street Photography aus Zürich 📸',
		location: 'Zürich, Schweiz',
		website: '',
		role: 'jury',
		stats: {
			submissions: 0,
			wins: 0,
			totalVotes: 0
		},
		createdAt: new Date('2024-01-15').toISOString()
	},
	{
		_id: 'user_2',
		auth0Id: 'auth0|mock2',
		username: 'max_lens',
		name: 'Max Berger',
		email: 'max@example.com',
		avatar: 'https://i.pravatar.cc/150?img=2',
		bio: 'Landschaftsfotograf | Zürich & Umgebung',
		location: 'Zürich, Schweiz',
		website: '',
		role: 'admin',
		stats: {
			submissions: 0,
			wins: 0,
			totalVotes: 0
		},
		createdAt: new Date('2023-11-20').toISOString()
	},
	{
		_id: 'user_3',
		auth0Id: 'auth0|mock3',
		username: 'sarah_captures',
		name: 'Sarah Fischer',
		email: 'sarah@example.com',
		avatar: 'https://i.pravatar.cc/150?img=3',
		bio: 'Portrait & Urban Photography',
		location: 'Zürich, Schweiz',
		website: '',
		role: 'user',
		stats: {
			submissions: 0,
			wins: 0,
			totalVotes: 0
		},
		createdAt: new Date('2024-02-10').toISOString()
	}
];

export const seedCompetitions = [
	{
		_id: 'comp_1',
		title: 'Zürich bei Nacht',
		description: 'Zeigt die Schönheit von Zürich nach Sonnenuntergang. Langzeitbelichtungen, Neonlichter, Stadtleben – alles ist erlaubt!',
		theme: 'Nachtfotografie',
		status: 'active',
		deadline: new Date('2024-12-31').toISOString(),
		startDate: new Date('2024-11-01').toISOString(),
		imageUrl: 'https://images.unsplash.com/photo-1517639493569-5666a7b2f494?w=1200&h=600&fit=crop',
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
		juryMembers: ['sarah_captures', 'anna_photos'],
		participantCount: 0,
		submissionCount: 0,
		votingWeight: {
			community: 0.6,
			jury: 0.4
		},
		winners: null,
		createdAt: new Date('2024-11-01').toISOString()
	},
	{
		_id: 'comp_2',
		title: 'Street Life',
		description: 'Einfängt die Menschen, Momente und Geschichten der Zürcher Strassen.',
		theme: 'Street Photography',
		status: 'voting',
		deadline: new Date('2024-11-20').toISOString(),
		startDate: new Date('2024-10-15').toISOString(),
		imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=600&fit=crop',
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
		participantCount: 0,
		submissionCount: 0,
		votingWeight: {
			community: 0.5,
			jury: 0.5
		},
		winners: null,
		createdAt: new Date('2024-10-15').toISOString()
	}
];

export const seedSubmissions = [
	{
		_id: 'sub_1',
		competitionId: 'comp_1',
		userId: 'user_1',
		title: 'Limmat Reflections',
		description: 'Langzeitbelichtung der Limmat mit Spiegelungen der Stadtlichter',
		imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
		votes: {
			community: 43,
			jury: 8.5
		},
		votedBy: [],
		comments: [],
		metadata: {
			camera: 'Sony A7III',
			lens: '24-70mm f/2.8',
			settings: 'f/11, 30s, ISO 100'
		},
		createdAt: new Date('2024-11-10').toISOString()
	},
	{
		_id: 'sub_2',
		competitionId: 'comp_1',
		userId: 'user_2',
		title: 'Grossmünster bei Vollmond',
		description: 'Die ikonischen Türme des Grossmünsters unter dem Vollmond',
		imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
		votes: {
			community: 38,
			jury: 9.0
		},
		votedBy: [],
		comments: [],
		metadata: {
			camera: 'Canon EOS R5',
			lens: '70-200mm f/2.8',
			settings: 'f/5.6, 4s, ISO 400'
		},
		createdAt: new Date('2024-11-12').toISOString()
	},
	{
		_id: 'sub_3',
		competitionId: 'comp_2',
		userId: 'user_3',
		title: 'Tram Stop Encounter',
		description: 'Zwei Fremde warten auf das Tram - ein kurzer Moment der Stille',
		imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop',
		votes: {
			community: 56,
			jury: 8.8
		},
		votedBy: [],
		comments: [],
		metadata: {
			camera: 'Fujifilm X-T4',
			lens: '35mm f/1.4',
			settings: 'f/2.8, 1/125s, ISO 800'
		},
		createdAt: new Date('2024-10-20').toISOString()
	}
];