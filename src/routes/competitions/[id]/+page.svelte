<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getCompetitionById, getSubmissionsByCompetitionId } from '$lib/api.js';
	import { getDaysUntilDeadline, formatDate } from '$lib/data/mockData';
	import SubmissionCard from '$lib/components/SubmissionCard.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import CommentSection from '$lib/components/CommentSection.svelte';
	import VotingPanel from '$lib/components/VotingPanel.svelte';
	
	let competition = null;
	let submissions = [];
	let loading = true;
	let error = null;
	let selectedSubmission = null;
	
	$: competitionId = $page.params.id;
	$: daysLeft = competition ? getDaysUntilDeadline(competition.deadline) : 0;
	
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
		selectedSubmission = submission;
	}
	
	function closeSubmissionDetail() {
		selectedSubmission = null;
	}
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
			<h2>❌ Fehler</h2>
			<p>{error}</p>
			<a href="/competitions" class="btn btn-primary">Zurück zu Wettbewerben</a>
		</div>
	</div>
{:else if competition}
	<div class="competition-hero" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url({competition.imageUrl})">
		<div class="container">
			<div class="hero-content">
				<div class="status-badge">
					<span class="badge badge-{competition.status === 'active' ? 'success' : competition.status === 'voting' ? 'warning' : 'primary'}">
						{competition.status === 'active' ? 'Aktiv' : competition.status === 'voting' ? 'Voting' : 'Abgeschlossen'}
					</span>
				</div>
				<h1>{competition.title}</h1>
				<p class="hero-description">{competition.description}</p>
				
				<div class="hero-meta">
					<div class="meta-item">
						<span class="icon">🎨</span>
						<span>{competition.theme}</span>
					</div>
					<div class="meta-item">
						<span class="icon">👥</span>
						<span>{competition.participantCount} Teilnehmer</span>
					</div>
					<div class="meta-item">
						<span class="icon">📸</span>
						<span>{competition.submissionCount} Submissions</span>
					</div>
					{#if competition.status !== 'completed'}
						<div class="meta-item">
							<span class="icon">⏰</span>
							<span>
								{#if daysLeft > 0}
									Noch {daysLeft} Tag{daysLeft === 1 ? '' : 'e'}
								{:else if daysLeft === 0}
									Endet heute!
								{:else}
									Abgelaufen
								{/if}
							</span>
						</div>
					{/if}
				</div>
				
				{#if competition.status === 'active'}
					<a href="/submit?competition={competition._id}" class="btn btn-primary btn-lg">
						Foto einreichen
					</a>
				{/if}
			</div>
		</div>
	</div>
	
	<div class="container">
		<div class="competition-content">
			<!-- Sidebar -->
			<aside class="sidebar">
				<div class="info-card">
					<h3>ℹ️ Details</h3>
					
					<div class="info-item">
						<strong>Start:</strong>
						<span>{formatDate(competition.startDate)}</span>
					</div>
					<div class="info-item">
						<strong>Deadline:</strong>
						<span>{formatDate(competition.deadline)}</span>
					</div>
					
					<div class="divider"></div>
					
					<h4>🏅 Preise</h4>
					<ul class="prizes-list">
						{#each competition.prizes as prize}
							<li>{prize}</li>
						{/each}
					</ul>
					
					<div class="divider"></div>
					
					<h4>📜 Regeln</h4>
					<ul class="rules-list">
						{#each competition.rules as rule}
							<li>{rule}</li>
						{/each}
					</ul>
					
					{#if competition.juryMembers && competition.juryMembers.length > 0}
						<div class="divider"></div>
						<h4>👨‍⚖️ Jury</h4>
						<ul class="jury-list">
							{#each competition.juryMembers as juryMember}
								<li>@{juryMember}</li>
							{/each}
						</ul>
					{/if}
				</div>
			</aside>
			
			<!-- Main Content -->
			<main class="main-content">
				<!-- Leaderboard -->
				<section class="section">
					<Leaderboard competitionId={competition._id} {submissions} {competition} />
				</section>
				
				<!-- Submissions Gallery -->
				<section class="section">
					<h2>📸 Alle Submissions ({submissions.length})</h2>
					
					<div class="grid grid-3">
						{#each submissions as submission}
							<div on:click={() => openSubmissionDetail(submission)} on:keydown={(e) => e.key === 'Enter' && openSubmissionDetail(submission)} role="button" tabindex="0">
								<SubmissionCard {submission} showVoting={competition.status === 'voting'} />
							</div>
						{/each}
					</div>
					
					{#if submissions.length === 0}
						<div class="empty-state">
							<p>Noch keine Submissions. Sei der Erste! 🎉</p>
							<a href="/submit?competition={competition._id}" class="btn btn-primary">
								Foto einreichen
							</a>
						</div>
					{/if}
				</section>
			</main>
		</div>
	</div>
	
	<!-- Submission Detail Modal -->
	{#if selectedSubmission}
		<div class="modal-overlay" on:click={closeSubmissionDetail} on:keydown={(e) => e.key === 'Escape' && closeSubmissionDetail()} role="button" tabindex="0">
			<div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1">
				<button class="close-btn" on:click={closeSubmissionDetail}>✕</button>
				
				<div class="modal-grid">
					<div class="modal-image">
						<img src={selectedSubmission.imageUrl} alt={selectedSubmission.title} />
					</div>
					
					<div class="modal-sidebar">
						<VotingPanel submission={selectedSubmission} />
						<div class="mt-3">
							<CommentSection submission={selectedSubmission} />
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
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
		padding: var(--spacing-3xl);
		min-height: 50vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.loading-state p {
		margin-top: var(--spacing-md);
		color: var(--color-text-secondary);
	}
	
	.error-state {
		text-align: center;
		padding: var(--spacing-3xl);
		min-height: 50vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.error-state h2 {
		margin-bottom: var(--spacing-md);
	}
	
	.error-state p {
		margin-bottom: var(--spacing-xl);
		color: var(--color-text-secondary);
	}
	
	/* Hero Section */
	.competition-hero {
		background-size: cover;
		background-position: center;
		color: white;
		padding: var(--spacing-3xl) 0;
		margin-bottom: var(--spacing-3xl);
	}
	
	.hero-content {
		max-width: 800px;
	}
	
	.status-badge {
		margin-bottom: var(--spacing-md);
	}
	
	.hero-content h1 {
		color: white;
		font-size: 3rem;
		margin-bottom: var(--spacing-md);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.hero-description {
		font-size: 1.25rem;
		margin-bottom: var(--spacing-xl);
		color: rgba(255, 255, 255, 0.95);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}
	
	.hero-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}
	
	.meta-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: rgba(255, 255, 255, 0.2);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		backdrop-filter: blur(10px);
	}
	
	.meta-item .icon {
		font-size: 1.125rem;
	}
	
	/* Content Layout */
	.competition-content {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: var(--spacing-2xl);
	}
	
	.sidebar {
		position: sticky;
		top: 100px;
		align-self: start;
	}
	
	.info-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border);
	}
	
	.info-card h3 {
		margin-bottom: var(--spacing-lg);
	}
	
	.info-card h4 {
		font-size: 1rem;
		margin-bottom: var(--spacing-md);
		color: var(--color-text-primary);
	}
	
	.info-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--spacing-sm);
		font-size: 0.875rem;
	}
	
	.info-item strong {
		color: var(--color-text-secondary);
	}
	
	.prizes-list, .rules-list, .jury-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.prizes-list li, .rules-list li {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
		padding-left: var(--spacing-md);
		position: relative;
	}
	
	.prizes-list li::before {
		content: "🏆";
		position: absolute;
		left: 0;
	}
	
	.rules-list li::before {
		content: "•";
		position: absolute;
		left: 0;
		color: var(--color-primary);
		font-weight: 700;
	}
	
	.jury-list li {
		font-size: 0.875rem;
		color: var(--color-primary);
		margin-bottom: var(--spacing-xs);
	}
	
	.section {
		margin-bottom: var(--spacing-3xl);
	}
	
	.empty-state {
		text-align: center;
		padding: var(--spacing-3xl);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
	}
	
	.empty-state p {
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-secondary);
	}
	
	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-lg);
	}
	
	.modal-content {
		background: white;
		border-radius: var(--radius-xl);
		max-width: 1400px;
		width: 100%;
		max-height: 90vh;
		overflow: auto;
		position: relative;
	}
	
	.close-btn {
		position: absolute;
		top: var(--spacing-lg);
		right: var(--spacing-lg);
		background: rgba(0, 0, 0, 0.5);
		color: white;
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1.5rem;
		z-index: 10;
		transition: all 0.2s;
	}
	
	.close-btn:hover {
		background: rgba(0, 0, 0, 0.8);
		transform: scale(1.1);
	}
	
	.modal-grid {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: var(--spacing-lg);
		padding: var(--spacing-lg);
	}
	
	.modal-image img {
		width: 100%;
		height: auto;
		border-radius: var(--radius-lg);
	}
	
	.modal-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}
	
	@media (max-width: 1024px) {
		.competition-content {
			grid-template-columns: 1fr;
		}
		
		.sidebar {
			position: static;
		}
		
		.modal-grid {
			grid-template-columns: 1fr;
		}
	}
	
	@media (max-width: 768px) {
		.hero-content h1 {
			font-size: 2rem;
		}
		
		.hero-description {
			font-size: 1rem;
		}
	}
</style>