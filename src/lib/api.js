const API_BASE = '/api';

// Get auth token from Auth0 client in store
let auth0ClientInstance = null;

export function setAuth0Client(client) {
	auth0ClientInstance = client;
}

async function getAuthHeaders() {
	const headers = { 'Content-Type': 'application/json' };

	if (auth0ClientInstance) {
		try {
			const token = await auth0ClientInstance.getTokenSilently();
			headers['Authorization'] = `Bearer ${token}`;
		} catch (error) {
			console.error('Error getting auth token:', error);
		}
	}

	return headers;
}

async function handleResponse(response) {
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'API request failed');
	}
	return response.json();
}

// ==================== USERS ====================

export async function getUsers() {
	const response = await fetch(`${API_BASE}/users`);
	return handleResponse(response);
}

export async function getUserByUsername(username) {
	const response = await fetch(`${API_BASE}/users/${username}`);
	return handleResponse(response);
}

export async function createUser(userData) {
	const response = await fetch(`${API_BASE}/users`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(userData)
	});
	return handleResponse(response);
}

// ==================== COMPETITIONS ====================

export async function getCompetitions(filter = null) {
	const url = filter ? `${API_BASE}/competitions?filter=${filter}` : `${API_BASE}/competitions`;
	const response = await fetch(url);
	return handleResponse(response);
}

export async function getCompetitionById(id) {
	const response = await fetch(`${API_BASE}/competitions/${id}`);
	return handleResponse(response);
}

export async function getSubmissionsByCompetitionId(competitionId) {
	const response = await fetch(`${API_BASE}/competitions/${competitionId}/submissions`);
	return handleResponse(response);
}

export async function createCompetition(competitionData) {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE}/competitions`, {
		method: 'POST',
		headers,
		body: JSON.stringify(competitionData)
	});
	return handleResponse(response);
}

export async function updateCompetition(competitionId, updates) {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE}/competitions/${competitionId}`, {
		method: 'PUT',
		headers,
		body: JSON.stringify(updates)
	});
	return handleResponse(response);
}

export async function deleteCompetition(competitionId) {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE}/competitions/${competitionId}`, {
		method: 'DELETE',
		headers
	});
	return handleResponse(response);
}

// ==================== SUBMISSIONS ====================

export async function getSubmissionById(submissionId) {
	const response = await fetch(`${API_BASE}/submissions/${submissionId}`);
	return handleResponse(response);
}

export async function createSubmission(submissionData) {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE}/submissions`, {
		method: 'POST',
		headers,
		body: JSON.stringify(submissionData)
	});
	return handleResponse(response);
}

export async function voteOnSubmission(submissionId, userId) {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE}/submissions/${submissionId}/vote`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ userId })
	});
	return handleResponse(response);
}

export async function checkIfUserVoted(submissionId, userId) {
	const response = await fetch(`${API_BASE}/submissions/${submissionId}/check-vote`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId })
	});
	return handleResponse(response);
}

export async function addCommentToSubmission(submissionId, commentData) {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE}/submissions/${submissionId}/comments`, {
		method: 'POST',
		headers,
		body: JSON.stringify(commentData)
	});
	return handleResponse(response);
}

export async function deleteSubmission(submissionId, userId) {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE}/submissions/${submissionId}`, {
		method: 'DELETE',
		headers,
		body: JSON.stringify({ userId })
	});
	return handleResponse(response);
}

// ==================== UPLOAD ====================

export async function uploadImage(file, folder = 'submissions') {
	const formData = new FormData();
	formData.append('image', file);
	formData.append('folder', folder);

	const response = await fetch(`${API_BASE}/upload`, {
		method: 'POST',
		body: formData
	});
	return handleResponse(response);
}

// ==================== IMAGE CLEANUP ====================

export async function deleteUploadedImage(imageUrl) {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE}/upload/delete`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ imageUrl })
	});
	return handleResponse(response);
}

// ==================== SEED ====================

export async function seedDatabase() {
	const response = await fetch(`${API_BASE}/seed`, {
		method: 'POST'
	});
	return handleResponse(response);
}

