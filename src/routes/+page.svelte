<script>
	import { onMount } from 'svelte';
	import { getCompetitions } from '$lib/api.js';
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	
	let activeCompetitions = [];
	let loading = true;
	
	onMount(async () => {
		try {
			activeCompetitions = await getCompetitions('active');
		} catch (error) {
			console.error('Error loading competitions:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>PhotoZürich - Community Platform für Zürcher Fotografen</title>
</svelte:head>

<!-- Hero Section -->
<section class="hero">
	<div class="container">
		<div class="hero-content">
			<h1>Willkommen bei PhotoZürich</h1>
			<p class="hero-subtitle">
				Die Community-Plattform für Zürcher Fotografen. Nimm an spannenden Wettbewerben teil, 
				erhalte echtes Feedback und vernetze dich mit Gleichgesinnten.
			</p>
			
			<div class="hero-actions">
				<a href="/competitions" class="btn btn-primary">
					Wettbewerbe entdecken
				</a>
				<a href="/submit" class="btn btn-secondary">
					Foto einreichen
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Hero Image Placeholder -->
<section class="hero-image">
	<div class="container">
		<div class="image-placeholder">
			<!-- Placeholder für Hero-Bild -->
			<!-- Später hier echtes Bild einfügen: -->
			<!-- <img src="/hero-image.jpg" alt="Hero" /> -->
		</div>
	</div>
</section>

<!-- Competitions Section -->
{#if !loading && activeCompetitions.length > 0}
	<section class="competitions-section">
		<div class="container">
			<div class="section-header">
				<h2>Aktuelle Wettbewerbe</h2>
			</div>
			
			<div class="competitions-grid">
				{#each activeCompetitions.slice(0, 3) as competition}
					<CompetitionCard {competition} />
				{/each}
			</div>
			
			{#if activeCompetitions.length > 3}
				<div class="view-more">
					<a href="/competitions" class="btn btn-secondary">
						Alle Wettbewerbe anzeigen
					</a>
				</div>
			{/if}
		</div>
	</section>
{/if}

<!-- Sponsors Section -->
<section class="sponsors">
	<div class="container">
		<h3>Sponsoren</h3>
		
		<div class="sponsors-grid">
			<div class="sponsor-logo">
				<svg width="60" height="60" viewBox="0 0 60 60" fill="none">
					<rect width="60" height="60" rx="12" fill="#9CA3AF"/>
				</svg>
			</div>
			<div class="sponsor-logo">
				<svg width="120" height="40" viewBox="0 0 120 40" fill="none">
					<rect width="120" height="40" rx="8" fill="#9CA3AF"/>
				</svg>
			</div>
			<div class="sponsor-logo">
				<svg width="60" height="60" viewBox="0 0 60 60" fill="none">
					<rect width="60" height="60" rx="12" fill="#9CA3AF"/>
				</svg>
			</div>
			<div class="sponsor-logo">
				<svg width="120" height="40" viewBox="0 0 120 40" fill="none">
					<rect width="120" height="40" rx="8" fill="#9CA3AF"/>
				</svg>
			</div>
			<div class="sponsor-logo">
				<svg width="80" height="50" viewBox="0 0 80 50" fill="none">
					<rect width="80" height="50" rx="10" fill="#9CA3AF"/>
				</svg>
			</div>
		</div>
	</div>
</section>

<style>
	/* Hero Section */
	.hero {
		padding: var(--spacing-4xl) 0 var(--spacing-3xl);
	}
	
	.hero-content {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
	}
	
	.hero h1 {
		font-size: 3.5rem;
		font-weight: 700;
		margin-bottom: var(--spacing-lg);
		letter-spacing: -0.03em;
		color: var(--color-text-primary);
		line-height: 1.1;
	}
	
	.hero-subtitle {
		font-size: 1.125rem;
		line-height: 1.7;
		margin-bottom: var(--spacing-2xl);
		color: var(--color-text-secondary);
		font-weight: 400;
		max-width: 640px;
		margin-left: auto;
		margin-right: auto;
	}
	
	.hero-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		flex-wrap: wrap;
	}
	
	/* Hero Image Placeholder */
	.hero-image {
		padding: 0 0 var(--spacing-4xl) 0;
	}
	
	.image-placeholder {
		width: 100%;
		height: 400px;
		background: linear-gradient(135deg, 
			#ffc0cb 0%, 
			#ffb6c1 15%,
			#ffd4e5 30%,
			#e6f7f0 50%,
			#b2f5ea 70%,
			#4fd1c5 85%,
			#38b2ac 100%
		);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xl);
		position: relative;
		overflow: hidden;
	}
	
	/* Wenn später ein echtes Bild verwendet wird: */
	.image-placeholder img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	
	/* Competitions Section */
	.competitions-section {
		padding: var(--spacing-4xl) 0;
	}
	
	.section-header {
		text-align: center;
		margin-bottom: var(--spacing-3xl);
	}
	
	.section-header h2 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0;
	}
	
	.competitions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: var(--spacing-2xl);
		margin-bottom: var(--spacing-2xl);
	}
	
	.view-more {
		text-align: center;
		margin-top: var(--spacing-3xl);
	}
	
	/* Sponsors Section */
	.sponsors {
		padding: var(--spacing-4xl) 0;
		border-top: 1px solid var(--color-border);
	}
	
	.sponsors h3 {
		text-align: center;
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-2xl);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.sponsors-grid {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-3xl);
		flex-wrap: wrap;
	}
	
	.sponsor-logo {
		opacity: 0.5;
		transition: opacity 0.2s;
	}
	
	.sponsor-logo:hover {
		opacity: 0.8;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 768px) {
		.hero {
			padding: var(--spacing-3xl) 0 var(--spacing-2xl);
		}
		
		.hero h1 {
			font-size: 2.25rem;
		}
		
		.hero-subtitle {
			font-size: 1rem;
		}
		
		.hero-actions {
			flex-direction: column;
			width: 100%;
		}
		
		.hero-actions .btn {
			width: 100%;
			justify-content: center;
		}
		
		.hero-image {
			padding: 0 0 var(--spacing-3xl) 0;
		}
		
		.image-placeholder {
			height: 280px;
		}
		
		.competitions-section {
			padding: var(--spacing-3xl) 0;
		}
		
		.competitions-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
		
		.sponsors {
			padding: var(--spacing-3xl) 0;
		}
		
		.sponsors-grid {
			gap: var(--spacing-xl);
		}
		
		.sponsor-logo svg {
			max-width: 80px;
			height: auto;
		}
	}
	
	@media (max-width: 480px) {
		.hero h1 {
			font-size: 1.875rem;
		}
		
		.image-placeholder {
			height: 220px;
			border-radius: var(--radius-lg);
		}
	}
</style>