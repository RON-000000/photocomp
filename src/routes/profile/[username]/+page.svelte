<script>
	import { page } from '$app/stores';
	import { getUserByUsername, getSubmissionsByCompetitionId, formatDate } from '$lib/data/mockData';
	import { submissions } from '$lib/stores/competitions';
	
	$: username = $page.params.username;
	$: user = getUserByUsername(username);
	$: userSubmissions = user ? $submissions.filter(s => s.userId === user.id) : [];
</script>

<svelte:head>
	<title>{user?.name || 'Profil'} - PhotoZürich</title>
</svelte:head>

{#if user}
	<div class="profile-hero">
		<div class="container">
			<div class="profile-header">
				<img src={user.avatar} alt={user.name} class="profile-avatar" />
				<div class="profile-info">
					<h1>{user.name}</h1>
					<p class="username">@{user.username}</p>
					<p class="bio">{user.bio}</p>
					<div class="meta">
						<span>📍 {user.location}</span>
						<span>📅 Dabei seit {formatDate(user.memberSince)}</span>
					</div>
				</div>
			</div>
			
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-value">{user.stats.submissions}</div>
					<div class="stat-label">Submissions</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{user.stats.wins}</div>
					<div class="stat-label">Siege</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{user.stats.votes}</div>
					<div class="stat-label">Votes erhalten</div>
				</div>
			</div>
		</div>
	</div>
	
	<div class="container">
		<!-- Portfolio -->
		<section class="section">
			<h2>🎨 Portfolio</h2>
			
			{#if user.portfolio && user.portfolio.length > 0}
				<div class="grid grid-3">
					{#each user.portfolio as photo}
						<div class="portfolio-item">
							<img src={photo.imageUrl} alt={photo.title} />
							<div class="portfolio-overlay">
								<h4>{photo.title}</h4>
								{#if photo.description}
									<p>{photo.description}</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>Noch keine Portfolio-Bilder.</p>
				</div>
			{/if}
		</section>
		
		<!-- Competition Submissions -->
		<section class="section">
			<h2>🏆 Wettbewerbs-Submissions</h2>
			
			{#if userSubmissions.length > 0}
				<div class="grid grid-3">
					{#each userSubmissions as submission}
						<div class="submission-item">
							<img src={submission.imageUrl} alt={submission.title} />
							<div class="submission-info">
								<h4>{submission.title}</h4>
								<div class="submission-meta">
									<span>👍 {submission.votes.community}</span>
									<span>⭐ {submission.votes.jury.toFixed(1)}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>Noch keine Wettbewerbs-Submissions.</p>
				</div>
			{/if}
		</section>
	</div>
{:else}
	<div class="container">
		<div class="error-state">
			<h2>Benutzer nicht gefunden</h2>
			<p>Der gesuchte Benutzer existiert nicht.</p>
			<a href="/" class="btn btn-primary">Zurück zur Startseite</a>
		</div>
	</div>
{/if}

<style>
	.profile-hero {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: var(--spacing-3xl) 0;
		margin-bottom: var(--spacing-3xl);
	}
	
	.profile-header {
		display: flex;
		gap: var(--spacing-xl);
		align-items: center;
		margin-bottom: var(--spacing-2xl);
	}
	
	.profile-avatar {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		border: 4px solid white;
		box-shadow: var(--shadow-xl);
	}
	
	.profile-info h1 {
		color: white;
		margin-bottom: var(--spacing-xs);
	}
	
	.username {
		font-size: 1.125rem;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: var(--spacing-md);
	}
	
	.bio {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.95);
		margin-bottom: var(--spacing-md);
	}
	
	.meta {
		display: flex;
		gap: var(--spacing-lg);
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-lg);
	}
	
	.stat-card {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		padding: var(--spacing-xl);
		border-radius: var(--radius-lg);
		text-align: center;
	}
	
	.stat-value {
		font-size: 2.5rem;
		font-weight: 700;
		color: white;
		margin-bottom: var(--spacing-xs);
	}
	
	.stat-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.section {
		margin-bottom: var(--spacing-3xl);
	}
	
	.portfolio-item, .submission-item {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		transition: all 0.3s;
		cursor: pointer;
	}
	
	.portfolio-item:hover, .submission-item:hover {
		box-shadow: var(--shadow-lg);
		transform: translateY(-4px);
	}
	
	.portfolio-item img, .submission-item img {
		width: 100%;
		height: 300px;
		object-fit: cover;
	}
	
	.portfolio-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		padding: var(--spacing-xl) var(--spacing-md) var(--spacing-md);
		color: white;
		opacity: 0;
		transition: opacity 0.3s;
	}
	
	.portfolio-item:hover .portfolio-overlay {
		opacity: 1;
	}
	
	.portfolio-overlay h4 {
		margin-bottom: var(--spacing-xs);
		color: white;
	}
	
	.portfolio-overlay p {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}
	
	.submission-info {
		padding: var(--spacing-md);
		background: white;
	}
	
	.submission-info h4 {
		margin-bottom: var(--spacing-sm);
		font-size: 1rem;
	}
	
	.submission-meta {
		display: flex;
		gap: var(--spacing-md);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
	
	.empty-state {
		text-align: center;
		padding: var(--spacing-3xl);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
	}
	
	.empty-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}
	
	.error-state {
		text-align: center;
		padding: var(--spacing-3xl);
	}
	
	@media (max-width: 768px) {
		.profile-header {
			flex-direction: column;
			text-align: center;
		}
		
		.stats-grid {
			grid-template-columns: 1fr;
		}
		
		.meta {
			flex-direction: column;
			gap: var(--spacing-sm);
		}
	}
</style>