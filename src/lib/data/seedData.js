export const seedSubmissions = [
	{
		_id: 'sub1',
		competitionId: 'comp1',
		userId: 'testuser', // Username des Users
		title: 'Limmat Reflections',
		description: 'Langzeitbelichtung der Limmat mit Spiegelungen der Stadtlichter',
		imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
		votes: {
			community: 43,
			jury: 8.5
		},
		votedBy: [], // Array für user IDs die gevotet haben
		comments: [],
		metadata: {
			camera: 'Sony A7III',
			lens: '24-70mm f/2.8',
			settings: 'f/11, 30s, ISO 100'
		},
		createdAt: new Date('2024-11-10').toISOString()
	},
	// ... weitere submissions
];