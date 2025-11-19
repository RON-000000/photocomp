<script>
	import { seedDatabase } from '$lib/api.js';
	
	let loading = false;
	let result = null;
	let error = null;
	
	async function handleSeed() {
		loading = true;
		error = null;
		result = null;
		
		try {
			result = await seedDatabase();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Datenbank initialisieren - PhotoZürich</title>
</svelte:head>

<div class="container-sm">
	<div class="seed-page">
		<h1>🌱 Datenbank initialisieren</h1>
		<p>Klicke auf den Button um die Datenbank mit Mock-Daten zu füllen.</p>
		
		<button 
			class="btn btn-primary btn-lg" 
			on:click={handleSeed}
			disabled={loading}
		>
			{#if loading}
				<span class="loading"></span>
				Wird initialisiert...
			{:else}
				Datenbank initialisieren
			{/if}
		</button>
		
		{#if result}
			<div class="success-box">
				<h3>✅ Erfolgreich!</h3>
				<pre>{JSON.stringify(result, null, 2)}</pre>
				<a href="/" class="btn btn-primary">Zur Startseite</a>
			</div>
		{/if}
		
		{#if error}
			<div class="error-box">
				<h3>❌ Fehler</h3>
				<p>{error}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.seed-page {
		text-align: center;
		padding: var(--spacing-3xl);
		background: white;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		margin: var(--spacing-3xl) 0;
	}
	
	.seed-page h1 {
		margin-bottom: var(--spacing-md);
	}
	
	.seed-page p {
		margin-bottom: var(--spacing-xl);
		color: var(--color-text-secondary);
	}
	
	.success-box, .error-box {
		margin-top: var(--spacing-xl);
		padding: var(--spacing-xl);
		border-radius: var(--radius-md);
		text-align: left;
	}
	
	.success-box {
		background: #d1fae5;
		border: 2px solid #10b981;
	}
	
	.error-box {
		background: #fee2e2;
		border: 2px solid #ef4444;
	}
	
	.success-box h3 {
		color: #065f46;
		margin-bottom: var(--spacing-md);
	}
	
	.error-box h3 {
		color: #991b1b;
		margin-bottom: var(--spacing-md);
	}
	
	pre {
		background: rgba(0, 0, 0, 0.05);
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		overflow-x: auto;
		font-size: 0.875rem;
		margin-bottom: var(--spacing-md);
	}
</style>