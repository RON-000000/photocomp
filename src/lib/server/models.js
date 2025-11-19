import { ObjectId } from 'mongodb';
import { getCollection } from './db.js';

// Helper function to generate UUID
function generateId() {
	return new ObjectId().toString();
}

// ==================== USERS ====================

export async function createUser(userData) {
	const users = await getCollection('users');
	
	const user = {
		_id: generateId(),
		username: userData.username,
		name: userData.name,
		avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.username}`,
		bio: userData.bio || '',
		location: userData.location || 'Zürich',
		memberSince: new Date().toISOString(),
		stats: {
			submissions: 0,
			wins: 0,
			votes: 0
		},
		portfolio: [],
		createdAt: new Date()
	};
	
	await users.insertOne(user);
	return user;
}

export async function getUserById(userId) {
	const users = await getCollection('users');
	return await users.findOne({ _id: userId });
}

export async function getUserByUsername(username) {
	const users = await getCollection('users');
	return await users.findOne({ username });
}

export async function getAllUsers() {
	const users = await getCollection('users');
	return await users.find({}).toArray();
}

export async function updateUserStats(userId, updates) {
	const users = await getCollection('users');
	return await users.updateOne(
		{ _id: userId },
		{ $inc: updates }
	);
}

// ==================== COMPETITIONS ====================

export async function createCompetition(competitionData) {
	const competitions = await getCollection('competitions');
	
	const competition = {
		_id: generateId(),
		title: competitionData.title,
		description: competitionData.description,
		theme: competitionData.theme,
		status: competitionData.status || 'active',
		deadline: competitionData.deadline,
		startDate: competitionData.startDate || new Date().toISOString(),
		imageUrl: competitionData.imageUrl,
		prizes: competitionData.prizes || [],
		rules: competitionData.rules || [],
		juryMembers: competitionData.juryMembers || [],
		participantCount: 0,
		submissionCount: 0,
		votingWeight: competitionData.votingWeight || {
			community: 0.6,
			jury: 0.4
		},
		winners: null,
		createdAt: new Date()
	};
	
	await competitions.insertOne(competition);
	return competition;
}

export async function getCompetitionById(competitionId) {
	const competitions = await getCollection('competitions');
	return await competitions.findOne({ _id: competitionId });
}

export async function getAllCompetitions() {
	const competitions = await getCollection('competitions');
	return await competitions.find({}).sort({ createdAt: -1 }).toArray();
}

export async function getActiveCompetitions() {
	const competitions = await getCollection('competitions');
	return await competitions.find({ 
		status: { $in: ['active', 'voting'] } 
	}).sort({ createdAt: -1 }).toArray();
}

export async function getCompletedCompetitions() {
	const competitions = await getCollection('competitions');
	return await competitions.find({ 
		status: 'completed' 
	}).sort({ createdAt: -1 }).toArray();
}

export async function updateCompetition(competitionId, updates) {
	const competitions = await getCollection('competitions');
	return await competitions.updateOne(
		{ _id: competitionId },
		{ $set: updates }
	);
}

export async function incrementCompetitionStats(competitionId, field) {
	const competitions = await getCollection('competitions');
	return await competitions.updateOne(
		{ _id: competitionId },
		{ $inc: { [field]: 1 } }
	);
}

// ==================== SUBMISSIONS ====================

export async function createSubmission(submissionData) {
	const submissions = await getCollection('submissions');
	
	const submission = {
		_id: generateId(),
		competitionId: submissionData.competitionId,
		userId: submissionData.userId,
		title: submissionData.title,
		description: submissionData.description,
		imageUrl: submissionData.imageUrl,
		votes: {
			community: 0,
			jury: 0
		},
		votedBy: [],
		comments: [],
		metadata: submissionData.metadata || {},
		createdAt: new Date().toISOString()
	};
	
	await submissions.insertOne(submission);
	
	// Update competition stats
	await incrementCompetitionStats(submissionData.competitionId, 'submissionCount');
	
	// Update user stats
	await updateUserStats(submissionData.userId, { 'stats.submissions': 1 });
	
	return submission;
}

export async function getSubmissionById(submissionId) {
	const submissions = await getCollection('submissions');
	return await submissions.findOne({ _id: submissionId });
}

export async function getSubmissionsByCompetitionId(competitionId) {
	const submissions = await getCollection('submissions');
	return await submissions.find({ competitionId }).toArray();
}

export async function getSubmissionsByUserId(userId) {
	const submissions = await getCollection('submissions');
	return await submissions.find({ userId }).toArray();
}

export async function addVote(submissionId) {
	const submissions = await getCollection('submissions');
	return await submissions.updateOne(
		{ _id: submissionId },
		{ $inc: { 'votes.community': 1 } }
	);
}

export async function addComment(submissionId, commentData) {
	const submissions = await getCollection('submissions');
	
	const comment = {
		id: generateId(),
		userId: commentData.userId,
		username: commentData.username,
		text: commentData.text,
		createdAt: new Date().toISOString()
	};
	
	await submissions.updateOne(
		{ _id: submissionId },
		{ $push: { comments: comment } }
	);
	
	return comment;
}



// ==================== HELPER FUNCTIONS ====================

export async function seedMockData() {
	// Check if data already exists
	const users = await getCollection('users');
	const existingUsers = await users.countDocuments();
	
	if (existingUsers > 0) {
		return { message: 'Database already seeded' };
	}
	
	// Import mock data
	const { mockUsers, mockCompetitions, mockSubmissions } = await import('$lib/data/mockData.js');
	
	// Insert users
	const usersCollection = await getCollection('users');
	await usersCollection.insertMany(mockUsers.map(user => ({
		...user,
		_id: user.id,
		createdAt: new Date()
	})));
	
	// Insert competitions
	const competitionsCollection = await getCollection('competitions');
	await competitionsCollection.insertMany(mockCompetitions.map(comp => ({
		...comp,
		_id: comp.id,
		createdAt: new Date()
	})));
	
	// Insert submissions
	const submissionsCollection = await getCollection('submissions');
	await submissionsCollection.insertMany(mockSubmissions.map(sub => ({
		...sub,
		_id: sub.id,
		createdAt: new Date()
	})));
	
	return { message: 'Database seeded successfully' };
}

export async function addVoteWithUser(submissionId, userId) {
	const submissions = await getCollection('submissions');
	
	// Check if user already voted
	const submission = await submissions.findOne({ _id: submissionId });
	if (!submission) {
		throw new Error('Submission nicht gefunden');
	}
	
	if (submission.votedBy && submission.votedBy.includes(userId)) {
		throw new Error('Du hast bereits für diese Submission gevotet');
	}
	
	// Add vote
	const result = await submissions.updateOne(
		{ _id: submissionId },
		{ 
			$inc: { 'votes.community': 1 },
			$push: { votedBy: userId }
		}
	);
	
	return result;
}

export async function hasUserVoted(submissionId, userId) {
	const submissions = await getCollection('submissions');
	const submission = await submissions.findOne({ _id: submissionId });
	
	if (!submission) return false;
	
	return submission.votedBy && submission.votedBy.includes(userId);
}

// User Profile Functions
export async function getUserByUsername(username) {
	const users = await getCollection('users');
	const user = await users.findOne({ username });
	
	if (!user) {
		throw new Error('User nicht gefunden');
	}
	
	// Get user's submissions
	const submissions = await getCollection('submissions');
	const userSubmissions = await submissions
		.find({ userId: user._id })
		.sort({ createdAt: -1 })
		.toArray();
	
	// Calculate stats
	const totalVotes = userSubmissions.reduce((sum, sub) => sum + (sub.votes?.community || 0), 0);
	const wins = 0; // TODO: Implement wins calculation based on competition winners
	
	return {
		...user,
		submissions: userSubmissions,
		stats: {
			submissions: userSubmissions.length,
			wins: wins,
			totalVotes: totalVotes
		}
	};
}

export async function updateUserProfile(userId, updates) {
	const users = await getCollection('users');
	
	const allowedUpdates = {
		name: updates.name,
		bio: updates.bio,
		location: updates.location,
		website: updates.website,
		avatar: updates.avatar
	};
	
	// Remove undefined values
	Object.keys(allowedUpdates).forEach(key => 
		allowedUpdates[key] === undefined && delete allowedUpdates[key]
	);
	
	const result = await users.updateOne(
		{ _id: userId },
		{ $set: allowedUpdates }
	);
	
	if (result.matchedCount === 0) {
		throw new Error('User nicht gefunden');
	}
	
	return await users.findOne({ _id: userId });
}

export async function getUserSubmissions(userId) {
	const submissions = await getCollection('submissions');
	return await submissions
		.find({ userId })
		.sort({ createdAt: -1 })
		.toArray();
}