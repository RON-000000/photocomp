<script>
	import { onMount } from 'svelte';
	import { handleCallback, isLoading } from '$lib/stores/auth0';
	
	onMount(async () => {
		await handleCallback();
	});
</script>

<div class="callback-wrapper">
	<div class="callback-content">
		<span class="loading"></span>
		<h2>Authentifizierung läuft...</h2>
		<p>Du wirst gleich weitergeleitet.</p>
	</div>
</div>

<style>
	.callback-wrapper {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface);
	}
	
	.callback-content {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-lg);
	}
	
	.callback-content h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		color: var(--color-text-primary);
	}
	
	.callback-content p {
		color: var(--color-text-secondary);
		margin: 0;
	}
</style>