<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getCompetitionById, getSubmissionsByCompetitionId } from '$lib/api.js';
	import { formatDate } from '$lib/data/mockData';
	import SubmissionCard from '$lib/components/SubmissionCard.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import { Calendar, Users, Image, Award, FileText, Scale, Upload } from 'lucide-svelte';

	let competition = null;
	let submissions = [];
	let loading = true;
	let error = null;

	$: competitionId = $page.params.id;

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		error = null;

		try {
			competition = await getCompetitionById(competitionId);
			submissions = await getSubmissionsByCompetitionId(competitionId);
		} catch (err) {
			error = err.message;
			console.error('Error loading competition:', err);
		} finally {
			loading = false;
		}
	}

	function openSubmissionDetail(submission) {
		goto(`/submissions/${submission._id}`);
	}
	
	// Berechne Status basierend auf Datum
	function getStatus(comp) {
		const now = new Date();
		const deadline = new Date(comp.deadline);
		
		if (now > deadline) return 'completed';
		return comp.status || 'active';
	}
	
	$: currentStatus = competition ? getStatus(competition) : null;
	$: statusBadge = currentStatus === 'active' ? 'success' : 
	                 currentStatus === 'voting' ? 'warning' : 'primary';
	$: statusText = currentStatus === 'active' ? 'AKTIV' : 
	                currentStatus === 'voting' ? 'VOTING' : 'BEENDET';
</script>

<svelte:head>
	<title>{competition?.title || 'Wettbewerb'} - PhotoZürich</title>
</svelte:head>

{#if loading}
	<div class="loading-state">
		<span class="loading"></span>
		<p>Lade Wettbewerb...</p>
	</div>
{:else if error}
	<div class="container">
		<div class="error-state">
			<h2>Fehler</h2>
			<p>{error}</p>
			<a href="/competitions" class="btn btn-primary">Zurück zu Wettbewerben</a>
		</div>
	</div>
{:else if competition}
	<!-- Hero Section -->
	<section class="competition-hero">
		<div class="hero-image">
			<img src={competition.imageUrl} alt={competition.title} />
			<div class="hero-overlay"></div>
		</div>
		<div class="container">
			<div class="hero-content">
				<div class="status-badge">
					<span class="badge badge-{statusBadge}">{statusText}</span>
				</div>
				<h1>{competition.title}</h1>
				<p class="hero-subtitle">{competition.description}</p>
			</div>
		</div>
	</section>
	
	<div class="container">
		<div class="content-wrapper">
			<!-- Main Content -->
			<div class="main-content">
				<!-- Stats Section -->
				<div class="stats-section">
					<div class="stat-item">
						<Calendar size={20} />
						<div>
							<div class="stat-label">Deadline</div>
							<div class="stat-value">{formatDate(competition.deadline)}</div>
						</div>
					</div>
					<div class="stat-item">
						<Users size={20} />
						<div>
							<div class="stat-label">Teilnehmer</div>
							<div class="stat-value">{competition.participantCount || 0}</div>
						</div>
					</div>
					<div class="stat-item">
						<Image size={20} />
						<div>
							<div class="stat-label">Submissions</div>
							<div class="stat-value">{competition.submissionCount || 0}</div>
						</div>
					</div>
				</div>
				
				{#if currentStatus === 'active'}
					<div class="cta-section">
						<a href="/submit?competition={competition._id}" class="btn btn-primary btn-lg">
							<Upload size={20} />
							<span>Foto einreichen</span>
						</a>
					</div>
				{/if}
				
				<!-- Leaderboard -->
				<section class="section">
					<Leaderboard competitionId={competition._id} {submissions} {competition} />
				</section>
				
				<!-- Submissions Gallery -->
				<section class="section">
					<div class="section-header">
						<h2>Alle Submissions</h2>
						<span class="count">{submissions.length}</span>
					</div>
					
					{#if submissions.length > 0}
						<div class="submissions-grid">
							{#each submissions as submission}
								<button 
									class="submission-wrapper"
									on:click={() => openSubmissionDetail(submission)}
								>
									<SubmissionCard {submission} showVoting={currentStatus === 'voting'} />
								</button>
							{/each}
						</div>
					{:else}
						<div class="empty-state">
							<p>Noch keine Submissions.</p>
							{#if currentStatus === 'active'}
								<a href="/submit?competition={competition._id}" class="btn btn-primary">
									Sei der Erste!
								</a>
							{/if}
						</div>
					{/if}
				</section>
			</div>
			
			<!-- Sidebar -->
			<aside class="sidebar">
				<div class="info-card">
					<h3>
						<FileText size={20} />
						<span>Details</span>
					</h3>
					
					<div class="info-section">
						<div class="info-label">Thema</div>
						<div class="info-value">{competition.theme}</div>
					</div>
					
					<div class="info-section">
						<div class="info-label">Start</div>
						<div class="info-value">{formatDate(competition.startDate)}</div>
					</div>
					
					<div class="info-section">
						<div class="info-label">Deadline</div>
						<div class="info-value">{formatDate(competition.deadline)}</div>
					</div>
				</div>
				
				<div class="info-card">
					<h3>
						<Award size={20} />
						<span>Preise</span>
					</h3>
					
					<ul class="prizes-list">
						{#each competition.prizes as prize, index}
							<li>
								<span class="prize-position">{index + 1}.</span>
								<span>{prize}</span>
							</li>
						{/each}
					</ul>
				</div>
				
				<div class="info-card">
					<h3>
						<Scale size={20} />
						<span>Regeln</span>
					</h3>
					
					<ul class="rules-list">
						{#each competition.rules as rule}
							<li>{rule}</li>
						{/each}
					</ul>
				</div>
				
				{#if competition.juryMembers && competition.juryMembers.length > 0}
					<div class="info-card">
						<h3>
							<Users size={20} />
							<span>Jury</span>
						</h3>
						
						<ul class="jury-list">
							{#each competition.juryMembers as juryMember}
								<li>@{juryMember}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</aside>
		</div>
	</div>
{:else}
	<div class="container">
		<div class="error-state">
			<h2>Wettbewerb nicht gefunden</h2>
			<p>Der gesuchte Wettbewerb existiert nicht.</p>
			<a href="/competitions" class="btn btn-primary">Zurück zu Wettbewerben</a>
		</div>
	</div>
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
	
	/* Hero Section */
	.competition-hero {
		position: relative;
		margin-bottom: var(--spacing-4xl);
	}
	
	.hero-image {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 500px;
		overflow: hidden;
	}
	
	.hero-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
	}
	
	.hero-content {
		position: relative;
		padding-top: 200px;
		padding-bottom: var(--spacing-3xl);
		color: white;
		max-width: 800px;
	}
	
	.status-badge {
		margin-bottom: var(--spacing-lg);
	}
	
	.hero-content h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: var(--spacing-md);
		color: white;
		letter-spacing: -0.03em;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.hero-subtitle {
		font-size: 1.25rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.95);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		margin: 0;
	}
	
	/* Content Layout */
	.content-wrapper {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: var(--spacing-3xl);
		margin-top: var(--spacing-4xl);
	}
	
	.main-content {
		min-width: 0;
	}
	
	/* Stats Section */
	.stats-section {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-3xl);
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-xl);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}
	
	.stat-item :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
	
	.stat-label {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
	}
	
	.stat-value {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	/* CTA Section */
	.cta-section {
		margin-bottom: var(--spacing-3xl);
		text-align: center;
		padding: var(--spacing-2xl);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 2px dashed var(--color-border);
	}
	
	.btn-lg {
		padding: var(--spacing-md) var(--spacing-2xl);
		font-size: 1rem;
	}
	
	/* Sections */
	.section {
		margin-bottom: var(--spacing-4xl);
	}
	
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-2xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid var(--color-border);
	}
	
	.section-header h2 {
		font-size: 1.5rem;
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
	
	/* Submissions Grid */
	.submissions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-2xl);
	}
	
	.submission-wrapper {
		all: unset;
		cursor: pointer;
		display: block;
	}
	
	.empty-state {
		text-align: center;
		padding: var(--spacing-4xl);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 2px dashed var(--color-border);
	}
	
	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
		font-size: 1.125rem;
	}
	
	/* Sidebar */
	.sidebar {
		position: sticky;
		top: 100px;
		align-self: start;
	}
	
	.info-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		border: 1px solid var(--color-border);
		margin-bottom: var(--spacing-lg);
	}
	
	.info-card:last-child {
		margin-bottom: 0;
	}
	
	.info-card h3 {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text-primary);
	}
	
	.info-card h3 :global(svg) {
		color: var(--color-text-muted);
	}
	
	.info-section {
		margin-bottom: var(--spacing-md);
	}
	
	.info-section:last-child {
		margin-bottom: 0;
	}
	
	.info-label {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
	}
	
	.info-value {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}
	
	.prizes-list,
	.rules-list,
	.jury-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.prizes-list li,
	.rules-list li {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
		padding: var(--spacing-sm) 0;
		border-bottom: 1px solid var(--color-border);
	}
	
	.prizes-list li:last-child,
	.rules-list li:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}
	
	.prizes-list li {
		display: flex;
		gap: var(--spacing-sm);
	}
	
	.prize-position {
		font-weight: 600;
		color: var(--color-primary);
	}
	
	.jury-list li {
		font-size: 0.9375rem;
		color: var(--color-primary);
		margin-bottom: var(--spacing-xs);
		font-weight: 500;
	}

	/* Mobile Optimizations */
	@media (max-width: 1024px) {
		.content-wrapper {
			grid-template-columns: 1fr;
		}

		.sidebar {
			position: static;
		}
	}
	
	@media (max-width: 768px) {
		.hero-image {
			height: 400px;
		}
		
		.hero-content {
			padding-top: 150px;
			padding-bottom: var(--spacing-2xl);
		}
		
		.hero-content h1 {
			font-size: 2rem;
		}
		
		.hero-subtitle {
			font-size: 1rem;
		}
		
		.stats-section {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}
		
		.submissions-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
		
		.close-btn {
			top: var(--spacing-md);
			right: var(--spacing-md);
			width: 40px;
			height: 40px;
		}
	}
	
	@media (max-width: 480px) {
		.hero-image {
			height: 300px;
		}
		
		.hero-content {
			padding-top: 100px;
		}
		
		.hero-content h1 {
			font-size: 1.5rem;
		}
	}
</style>