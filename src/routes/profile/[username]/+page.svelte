<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getUserByUsername } from '$lib/api.js';
	import SubmissionCard from '$lib/components/SubmissionCard.svelte';
	import { Calendar, MapPin, Link as LinkIcon, Trophy, Image as ImageIcon } from 'lucide-svelte';
	
	let user = null;
	let loading = true;
	let error = null;
	
	$: username = $page.params.username;
	
	onMount(async () => {
		await loadUser();
	});
	
	async function loadUser() {
		loading = true;
		error = null;
		
		try {
			user = await getUserByUsername(username);
		} catch (err) {
			error = err.message;
			console.error('Error loading user:', err);
		} finally {
			loading = false;
		}
	}
	
	function formatDate(dateString) {
		const date = new Date(dateString);
		const options = { year: 'numeric', month: 'long' };
		return date.toLocaleDateString('de-DE', options);
	}
</script>

<svelte:head>
	<title>{user?.name || username} - PhotoZürich</title>
</svelte:head>

{#if loading}
	<div class="loading-state">
		<span class="loading"></span>
		<p>Lade Profil...</p>
	</div>
{:else if error}
	<div class="container">
		<div class="error-state">
			<h2>Profil nicht gefunden</h2>
			<p>{error}</p>
			<a href="/" class="btn btn-primary">Zur Startseite</a>
		</div>
	</div>
{:else if user}
	<!-- Profile Hero -->
	<section class="profile-hero">
		<div class="container">
			<div class="hero-content">
				<img src={user.avatar} alt={user.name} class="profile-avatar" />
				<h1>{user.name}</h1>
				<p class="username">@{user.username}</p>
				{#if user.bio}
					<p class="bio">{user.bio}</p>
				{/if}
				
				<div class="profile-meta">
					{#if user.location}
						<div class="meta-item">
							<MapPin size={16} />
							<span>{user.location}</span>
						</div>
					{/if}
					{#if user.website}
						<a href={user.website} target="_blank" rel="noopener" class="meta-item meta-link">
							<LinkIcon size={16} />
							<span>{user.website.replace(/^https?:\/\//, '')}</span>
						</a>
					{/if}
					<div class="meta-item">
						<Calendar size={16} />
						<span>Mitglied seit {formatDate(user.createdAt)}</span>
					</div>
				</div>
			</div>
		</div>
	</section>
	
	<!-- Stats Section -->
	<section class="stats-section">
		<div class="container">
			<div class="stats-grid">
				<div class="stat-card">
					<ImageIcon size={32} />
					<div class="stat-value">{user.stats?.submissions || 0}</div>
					<div class="stat-label">Submissions</div>
				</div>
				<div class="stat-card">
					<Trophy size={32} />
					<div class="stat-value">{user.stats?.wins || 0}</div>
					<div class="stat-label">Siege</div>
				</div>
				<div class="stat-card">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
					</svg>
					<div class="stat-value">{user.stats?.totalVotes || 0}</div>
					<div class="stat-label">Total Votes</div>
				</div>
			</div>
		</div>
	</section>
	
	<!-- Submissions Section -->
	{#if user.submissions && user.submissions.length > 0}
		<section class="submissions-section">
			<div class="container">
				<div class="section-header">
					<h2>Submissions</h2>
					<span class="count">{user.submissions.length}</span>
				</div>
				
				<div class="submissions-grid">
					{#each user.submissions as submission}
						<SubmissionCard 
							{submission} 
							onClick={() => window.location.href = `/competitions/${submission.competitionId}`}
						/>
					{/each}
				</div>
			</div>
		</section>
	{:else}
		<section class="empty-section">
			<div class="container">
				<div class="empty-state">
					<ImageIcon size={64} />
					<h3>Noch keine Submissions</h3>
					<p>Dieser Nutzer hat noch keine Fotos eingereicht.</p>
				</div>
			</div>
		</section>
	{/if}
{/if}

<style>
	/* Loading & Error States */
	.loading-state {
		text-align: center;
		padding: var(--spacing-4xl);
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-lg);
	}
	
	.loading-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}
	
	.error-state {
		text-align: center;
		padding: var(--spacing-4xl);
		min-height: 50vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-lg);
	}
	
	.error-state h2 {
		margin-bottom: var(--spacing-sm);
	}
	
	.error-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}
	
	/* Profile Hero */
	.profile-hero {
		padding: var(--spacing-4xl) 0 var(--spacing-3xl);
	}
	
	.hero-content {
		max-width: 600px;
		margin: 0 auto;
		text-align: center;
	}
	
	.profile-avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		object-fit: cover;
		margin-bottom: var(--spacing-lg);
		border: 3px solid var(--color-border);
	}
	
	.hero-content h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: var(--spacing-xs);
		letter-spacing: -0.03em;
		color: var(--color-text-primary);
	}
	
	.username {
		font-size: 1.125rem;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-lg);
	}
	
	.bio {
		font-size: 1rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
	}
	
	.profile-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		justify-content: center;
		align-items: center;
	}
	
	.meta-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
	
	.meta-item :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
	
	.meta-link {
		color: var(--color-primary);
		text-decoration: none;
		transition: opacity 0.2s;
	}
	
	.meta-link:hover {
		opacity: 0.7;
	}
	
	/* Stats Section */
	.stats-section {
		padding: var(--spacing-4xl) 0;
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-2xl);
		max-width: 800px;
		margin: 0 auto;
	}
	
	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-2xl);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		transition: all 0.2s;
	}
	
	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}
	
	.stat-card :global(svg) {
		color: var(--color-text-muted);
	}
	
	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}
	
	.stat-label {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	/* Submissions Section */
	.submissions-section {
		padding: var(--spacing-4xl) 0;
	}
	
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-3xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid var(--color-border);
	}
	
	.section-header h2 {
		font-size: 2rem;
		font-weight: 600;
		margin: 0;
	}
	
	.section-header .count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0 var(--spacing-sm);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}
	
	.submissions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--spacing-2xl);
	}
	
	/* Empty Section */
	.empty-section {
		padding: var(--spacing-4xl) 0;
	}
	
	.empty-state {
		text-align: center;
		padding: var(--spacing-4xl);
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		max-width: 600px;
		margin: 0 auto;
	}
	
	.empty-state :global(svg) {
		color: var(--color-text-muted);
		opacity: 0.3;
		margin-bottom: var(--spacing-lg);
	}
	
	.empty-state h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: var(--spacing-sm);
		color: var(--color-text-primary);
	}
	
	.empty-state p {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin: 0;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 768px) {
		.profile-hero {
			padding: var(--spacing-3xl) 0 var(--spacing-2xl);
		}
		
		.profile-avatar {
			width: 100px;
			height: 100px;
		}
		
		.hero-content h1 {
			font-size: 2rem;
		}
		
		.username {
			font-size: 1rem;
		}
		
		.bio {
			font-size: 0.9375rem;
		}
		
		.profile-meta {
			flex-direction: column;
			gap: var(--spacing-sm);
		}
		
		.stats-section {
			padding: var(--spacing-3xl) 0;
		}
		
		.stats-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}
		
		.stat-card {
			padding: var(--spacing-xl);
		}
		
		.submissions-section {
			padding: var(--spacing-3xl) 0;
		}
		
		.section-header {
			margin-bottom: var(--spacing-2xl);
		}
		
		.section-header h2 {
			font-size: 1.5rem;
		}
		
		.submissions-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
		
		.empty-section {
			padding: var(--spacing-3xl) 0;
		}
		
		.empty-state {
			padding: var(--spacing-2xl);
		}
	}
	
	@media (max-width: 480px) {
		.profile-avatar {
			width: 80px;
			height: 80px;
		}
		
		.hero-content h1 {
			font-size: 1.75rem;
		}
		
		.stat-value {
			font-size: 1.5rem;
		}
	}
</style>