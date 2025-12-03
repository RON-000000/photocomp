import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { currentUser, isAuthenticated } from '$lib/stores/auth0';

export function load() {
	const authenticated = get(isAuthenticated);
	const user = get(currentUser);
	
	if (!authenticated) {
		throw redirect(307, '/');
	}
	
	if (user?.role !== 'admin') {
		throw redirect(307, '/');
	}
}