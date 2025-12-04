import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { setAuth0Client } from '$lib/api.js';

// Stores
export const isAuthenticated = writable(false);
export const isLoading = writable(true);
export const currentUser = writable(null);
export const auth0Client = writable(null);

let clientInstance = null;

// Initialize Auth0
export async function initAuth0() {
	if (!browser) return;
	
	isLoading.set(true);
	
	try {
		const client = await createAuth0Client({
			domain: 'photocomp.eu.auth0.com',
			clientId: 'sXBmWYDYNTdcxExUmqK5A7znsGyCMC1o',
			authorizationParams: {
				redirect_uri: window.location.origin + '/auth/callback'
			},
			cacheLocation: 'localstorage',
			useRefreshTokens: true
		});
		
		clientInstance = client;
		auth0Client.set(client);

		// Set auth client for API calls
		setAuth0Client(client);

		// Check if logged in
		const authenticated = await client.isAuthenticated();
		isAuthenticated.set(authenticated);
		
		if (authenticated) {
			const user = await client.getUser();
			await syncUserWithBackend(user);
		}
	} catch (error) {
		console.error('Auth0 initialization error:', error);
	} finally {
		isLoading.set(false);
	}
}

// Login
export async function login() {
	if (!clientInstance) {
		console.error('Auth0 client not initialized');
		return;
	}
	
	try {
		await clientInstance.loginWithRedirect({
			authorizationParams: {
				redirect_uri: window.location.origin + '/auth/callback'
			}
		});
	} catch (error) {
		console.error('Login error:', error);
	}
}

// Logout
export async function logout() {
	if (!clientInstance) return;
	
	currentUser.set(null);
	isAuthenticated.set(false);
	
	try {
		await clientInstance.logout({
			logoutParams: {
				returnTo: window.location.origin
			}
		});
	} catch (error) {
		console.error('Logout error:', error);
	}
}

// Handle Callback
export async function handleCallback() {
	if (!browser) return;
	if (!clientInstance) {
		console.error('Auth0 client not initialized');
		goto('/');
		return;
	}
	
	try {
		const searchParams = new URLSearchParams(window.location.search);
		
		if (searchParams.has('code') && searchParams.has('state')) {
			await clientInstance.handleRedirectCallback();
			
			const authenticated = await clientInstance.isAuthenticated();
			isAuthenticated.set(authenticated);
			
			if (authenticated) {
				const user = await clientInstance.getUser();
				await syncUserWithBackend(user);
				goto('/');
			} else {
				goto('/');
			}
		} else {
			goto('/');
		}
	} catch (error) {
		console.error('Auth0 callback error:', error);
		goto('/');
	}
}

// Sync User with Backend
async function syncUserWithBackend(auth0User) {
	console.log('🔍 Syncing user:', auth0User);

	try {
		// Safe username generation
		let username;
		if (auth0User.nickname) {
			username = auth0User.nickname;
		} else if (auth0User.email) {
			username = auth0User.email.split('@')[0];
		} else if (auth0User.name) {
			username = auth0User.name.toLowerCase().replace(/\s+/g, '');
		} else {
			username = 'user' + Date.now();
		}

		const response = await fetch('/api/auth/sync', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				auth0Id: auth0User.sub,
				email: auth0User.email || `${auth0User.sub}@noemail.local`,
				name: auth0User.name || 'PhotoZürich User',
				avatar: auth0User.picture || 'https://i.pravatar.cc/150?u=' + auth0User.sub,
				username: username
			})
		});

		console.log('📡 Sync response status:', response.status);

		if (response.ok) {
			const user = await response.json();
			console.log('✅ User synced:', user);
			currentUser.set(user);
		} else {
			const error = await response.text();
			console.error('❌ Sync failed:', error);
		}
	} catch (error) {
		console.error('💥 User sync error:', error);
	}
}

// Refresh user data from database
export async function refreshUserData() {
	if (!clientInstance) return;

	try {
		const authenticated = await clientInstance.isAuthenticated();
		if (authenticated) {
			const auth0User = await clientInstance.getUser();
			await syncUserWithBackend(auth0User);
		}
	} catch (error) {
		console.error('Error refreshing user data:', error);
	}
}