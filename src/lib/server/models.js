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
	const allCompetitions = await competitions.find({}).sort({ createdAt: -1 }).toArray();

	// Check and update status for each competition
	const now = new Date();
	const updatedCompetitions = await Promise.all(
		allCompetitions.map(async (comp) => {
			const deadline = new Date(comp.deadline);
			// Auto-transition to voting if deadline passed
			if (now > deadline && comp.status === 'active') {
				await updateCompetitionStatus(comp._id, 'voting');
				return { ...comp, status: 'voting' };
			}
			return comp;
		})
	);

	return updatedCompetitions;
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

export async function getJuryCompetitions(username) {
	const competitions = await getCollection('competitions');
	const juryCompetitions = await competitions.find({
		juryMembers: username
	}).sort({ createdAt: -1 }).toArray();

	// Check and update status for each competition
	const now = new Date();
	const updatedCompetitions = await Promise.all(
		juryCompetitions.map(async (comp) => {
			const deadline = new Date(comp.deadline);
			// Auto-transition to voting if deadline passed
			if (now > deadline && comp.status === 'active') {
				await updateCompetitionStatus(comp._id, 'voting');
				return { ...comp, status: 'voting' };
			}
			return comp;
		})
	);

	return updatedCompetitions;
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

export async function deleteCompetition(competitionId) {
	const competitions = await getCollection('competitions');
	const result = await competitions.deleteOne({ _id: competitionId });

	if (result.deletedCount === 0) {
		throw new Error('Competition nicht gefunden');
	}

	// Also delete all submissions for this competition
	const submissions = await getCollection('submissions');
	await submissions.deleteMany({ competitionId });

	return result;
}

export async function updateCompetitionStatus(competitionId, status) {
	const competitions = await getCollection('competitions');
	return await competitions.updateOne(
		{ _id: competitionId },
		{ $set: { status, updatedAt: new Date() } }
	);
}

export async function checkAndUpdateCompetitionStatus(competitionId) {
	const competitions = await getCollection('competitions');
	const competition = await competitions.findOne({ _id: competitionId });

	if (!competition) return null;

	const now = new Date();
	const deadline = new Date(competition.deadline);

	// Automatically transition to voting if deadline passed
	if (now > deadline && competition.status === 'active') {
		await updateCompetitionStatus(competitionId, 'voting');
		competition.status = 'voting';
	}

	return competition;
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
	const submission = await submissions.findOne({ _id: submissionId });

	if (!submission) {
		return null;
	}

	// Populate user data
	const users = await getCollection('users');
	const user = await users.findOne({ _id: submission.userId });

	return {
		...submission,
		user: user ? {
			_id: user._id,
			username: user.username,
			name: user.name,
			avatar: user.avatar
		} : null
	};
}

export async function getSubmissionsByCompetitionId(competitionId) {
	const submissions = await getCollection('submissions');
	const submissionsArray = await submissions.find({ competitionId }).toArray();

	// Populate user data for each submission
	const users = await getCollection('users');
	const populatedSubmissions = await Promise.all(
		submissionsArray.map(async (submission) => {
			const user = await users.findOne({ _id: submission.userId });
			return {
				...submission,
				user: user ? {
					_id: user._id,
					username: user.username,
					name: user.name,
					avatar: user.avatar
				} : null
			};
		})
	);

	return populatedSubmissions;
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

export async function deleteComment(submissionId, commentId, userId, userRole) {
	const submissions = await getCollection('submissions');

	const submission = await submissions.findOne({ _id: submissionId });
	if (!submission) {
		throw new Error('Submission nicht gefunden');
	}

	const comment = submission.comments.find(c => c.id === commentId);
	if (!comment) {
		throw new Error('Kommentar nicht gefunden');
	}

	// Check permissions: Owner of comment OR Admin OR Jury
	if (comment.userId !== userId && userRole !== 'admin' && userRole !== 'jury') {
		throw new Error('Keine Berechtigung zum Löschen dieses Kommentars');
	}

	const result = await submissions.updateOne(
		{ _id: submissionId },
		{ $pull: { comments: { id: commentId } } }
	);

	return result;
}

export async function deleteSubmission(submissionId, userId) {
	const submissions = await getCollection('submissions');

	// Get submission to check ownership
	const submission = await submissions.findOne({ _id: submissionId });

	if (!submission) {
		throw new Error('Submission nicht gefunden');
	}

	// Check if user owns the submission
	if (submission.userId !== userId) {
		throw new Error('Keine Berechtigung zum Löschen dieser Submission');
	}

	// Delete the submission
	const result = await submissions.deleteOne({ _id: submissionId });

	// Update competition stats
	if (submission.competitionId) {
		const competitions = await getCollection('competitions');
		await competitions.updateOne(
			{ _id: submission.competitionId },
			{ $inc: { submissionCount: -1 } }
		);
	}

	// Update user stats
	await updateUserStats(userId, { 'stats.submissions': -1 });

	return result;
}

export async function updateSubmission(submissionId, updates, userId) {
	const submissions = await getCollection('submissions');

	// Get submission to check ownership
	const submission = await submissions.findOne({ _id: submissionId });

	if (!submission) {
		throw new Error('Submission nicht gefunden');
	}

	// Check if user owns the submission
	if (submission.userId !== userId) {
		throw new Error('Keine Berechtigung zum Bearbeiten dieser Submission');
	}

	// Check deadline
	if (submission.competitionId) {
		const competitions = await getCollection('competitions');
		const competition = await competitions.findOne({ _id: submission.competitionId });

		if (competition) {
			const now = new Date();
			const deadline = new Date(competition.deadline);

			if (now > deadline) {
				throw new Error('Die Deadline für diesen Wettbewerb ist bereits abgelaufen. Bearbeitung nicht mehr möglich.');
			}
		}
	}

	// Filter allowed updates
	const allowedUpdates = {
		title: updates.title,
		description: updates.description,
		'metadata.camera': updates.metadata?.camera,
		'metadata.lens': updates.metadata?.lens,
		'metadata.settings': updates.metadata?.settings,
		updatedAt: new Date().toISOString()
	};

	// Remove undefined
	Object.keys(allowedUpdates).forEach(key =>
		allowedUpdates[key] === undefined && delete allowedUpdates[key]
	);

	const result = await submissions.updateOne(
		{ _id: submissionId },
		{ $set: allowedUpdates }
	);

	return result;
}

// ==================== JURY RATINGS ====================

export async function saveJuryRating(ratingData) {
	const ratings = await getCollection('juryRatings');

	const rating = {
		submissionId: ratingData.submissionId,
		competitionId: ratingData.competitionId,
		jurorUsername: ratingData.jurorUsername,
		rating: ratingData.rating,
		comment: ratingData.comment,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	// Upsert: Update if exists, insert if not
	await ratings.updateOne(
		{
			submissionId: ratingData.submissionId,
			jurorUsername: ratingData.jurorUsername
		},
		{ $set: rating },
		{ upsert: true }
	);

	// Update submission's jury vote average
	await updateSubmissionJuryAverage(ratingData.submissionId);

	return rating;
}

export async function getJuryRating(submissionId, jurorUsername) {
	const ratings = await getCollection('juryRatings');
	return await ratings.findOne({
		submissionId: submissionId,
		jurorUsername: jurorUsername
	});
}

async function updateSubmissionJuryAverage(submissionId) {
	const ratings = await getCollection('juryRatings');
	const submissions = await getCollection('submissions');

	// Get all ratings for this submission
	const allRatings = await ratings.find({ submissionId: submissionId }).toArray();

	if (allRatings.length === 0) {
		return;
	}

	// Calculate average
	const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
	const average = sum / allRatings.length;

	// Update submission
	await submissions.updateOne(
		{ _id: submissionId },
		{ $set: { 'votes.jury': average } }
	);
}

// ==================== HELPER FUNCTIONS ====================

export async function seedMockData() {
	// Check if data already exists
	const users = await getCollection('users');
	const existingUsers = await users.countDocuments();

	if (existingUsers > 0) {
		return { message: 'Database already seeded' };
	}

	// Import seed data
	const { seedUsers, seedCompetitions, seedSubmissions } = await import('$lib/data/seedData.js');

	// Insert users
	const usersCollection = await getCollection('users');
	await usersCollection.insertMany(seedUsers);

	// Insert competitions
	const competitionsCollection = await getCollection('competitions');
	await competitionsCollection.insertMany(seedCompetitions);

	// Insert submissions
	const submissionsCollection = await getCollection('submissions');
	await submissionsCollection.insertMany(seedSubmissions);

	return {
		message: 'Database seeded successfully',
		counts: {
			users: seedUsers.length,
			competitions: seedCompetitions.length,
			submissions: seedSubmissions.length
		}
	};
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

	// Add user data to each submission
	const submissionsWithUser = userSubmissions.map(sub => ({
		...sub,
		user: {
			_id: user._id,
			username: user.username,
			name: user.name,
			avatar: user.avatar
		}
	}));

	// Calculate stats
	const totalVotes = userSubmissions.reduce((sum, sub) => sum + (sub.votes?.community || 0), 0);
	const wins = 0; // TODO: Implement wins calculation based on competition winners

	return {
		...user,
		submissions: submissionsWithUser,
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

// ==================== ADMIN & ROLES ====================

export async function updateUserRole(userId, role) {
	const users = await getCollection('users');

	if (!['user', 'admin', 'jury'].includes(role)) {
		throw new Error('Ungültige Rolle');
	}

	const result = await users.updateOne(
		{ _id: userId },
		{ $set: { role } }
	);

	if (result.matchedCount === 0) {
		throw new Error('User nicht gefunden');
	}

	return await users.findOne({ _id: userId });
}

export async function getAllUsersWithRoles() {
	const users = await getCollection('users');
	return await users
		.find({})
		.project({ password: 0 })
		.sort({ createdAt: -1 })
		.toArray();
}

export async function getJuryMembers() {
	const users = await getCollection('users');
	return await users
		.find({ role: 'jury' })
		.project({ password: 0 })
		.toArray();
}

export async function getAdminStats() {
	const users = await getCollection('users');
	const competitions = await getCollection('competitions');
	const submissions = await getCollection('submissions');

	const totalUsers = await users.countDocuments();
	const totalCompetitions = await competitions.countDocuments();
	const totalSubmissions = await submissions.countDocuments();
	const activeCompetitions = await competitions.countDocuments({ status: 'active' });

	// Get recent users
	const recentUsers = await users
		.find({})
		.project({ password: 0 })
		.sort({ createdAt: -1 })
		.limit(5)
		.toArray();

	return {
		totalUsers,
		totalCompetitions,
		totalSubmissions,
		activeCompetitions,
		recentUsers
	};
}