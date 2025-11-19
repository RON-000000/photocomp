import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getUserByUsername, createUser } from '$lib/api.js';

// Load from localStorage
const stored = browser ? localStorage.getItem('currentUser') : null;
export const currentUser = writable(stored ? JSON.parse(stored) : null);

// Subscribe to save to localStorage
if (browser) {
	currentUser.subscribe(user => {
		if (user) {
			localStorage.setItem('currentUser', JSON.stringify(user));
		} else {
			localStorage.removeItem('currentUser');
		}
	});
}

// Login (check if user exists, create if not)
export async function login(username, name = null) {
	try {
		let user = await getUserByUsername(username);
		
		// If user doesn't exist, create them
		if (!user) {
			user = await createUser({
				username,
				name: name || username,
				bio: '',
				location: 'Zürich'
			});
		}
		
		currentUser.set(user);
		return { success: true, user };
	} catch (error) {
		console.error('Login error:', error);
		return { success: false, error: error.message };
	}
}

// Logout
export function logout() {
	currentUser.set(null);
}

// Auto-login for development
export async function autoLogin() {
	// Check if already logged in
	if (stored) {
		return;
	}
	
	// Auto-login as anna_photos
	await login('anna_photos', 'Anna Mueller');
}