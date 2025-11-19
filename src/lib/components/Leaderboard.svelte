<script>
	import { formatDate } from '$lib/data/mockData';
	
	export let competitionId;
	export let submissions = [];
	export let competition = null;
	export let showTopOnly = false;
	
	// Calculate leaderboard
	$: leaderboard = calculateLeaderboard(submissions, competition);
	$: displayedLeaderboard = showTopOnly ? leaderboard.slice(0, 3) : leaderboard;
	
	function calculateLeaderboard(subs, comp) {
		if (!subs || subs.length === 0) return [];
		
		const votingWeight = comp?.votingWeight || { community: 0.6, jury: 0.4 };
		
		return subs.map(sub => {
			// Normalize community votes (assume max 100 votes = 10 points)
			const communityScore = Math.min(sub.votes.community / 10, 10);
			const juryScore = sub.votes.jury;
			
			const totalScore = (communityScore * votingWeight.community) + 
			                   (juryScore * votingWeight.jury);
			
			return {
				...sub,
				totalScore
			};
		}).sort((a, b) => b.totalScore - a.totalScore);
	}
</script>

<div class="leaderboard">
	<div class="leaderboard-header">
		<h3>🏆 Leaderboard</h3>
		{#if showTopOnly && submissions.length > 3}
			<a href="/competitions/{competitionId}" class="view-all">Alle anzeigen →</a>
		{/if}
	</div>
	
	{#if displayedLeaderboard.length === 0}
		<div class="empty-state">
			<p>Noch keine Submissions im Leaderboard.</p>
		</div>
	{:else}
		<div class="leaderboard-table">
			{#each displayedLeaderboard as entry, index}
				<div class="leaderboard-row" class:winner={index < 3}>
					<div class="rank">
						{#if index === 0}
							🥇
						{:else if index === 1}
							🥈
						{:else if index === 2}
							🥉
						{:else}
							<span class="rank-number">#{index + 1}</span>
						{/if}
					</div>
					
					<div class="submission-preview">
						<img src={entry.imageUrl} alt={entry.title} />
					</div>
					
					<div class="submission-info">
						<a href="/profile/{entry.userId}" class="photographer">
							<img src="https://i.pravatar.cc/150?u={entry.userId}" alt="User" class="avatar" />
							<span>{entry.userId}</span>
						</a>
						<p class="title">{entry.title}</p>
					</div>
					
					<div class="scores">
						<div class="score-item">
							<span class="label">Community</span>
							<span class="value">👍 {entry.votes.community}</span>
						</div>
						<div class="score-item">
							<span class="label">Jury</span>
							<span class="value">⭐ {entry.votes.jury.toFixed(1)}</span>
						</div>
						<div class="score-item total">
							<span class="label">Total</span>
							<span class="value total-score">{entry.totalScore.toFixed(2)}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.leaderboard {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border);
	}
	
	.leaderboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}
	
	.leaderboard-header h3 {
		margin: 0;
	}
	
	.view-all {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-primary);
	}
	
	.empty-state {
		text-align: center;
		padding: var(--spacing-xl);
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}
	
	.empty-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}
	
	.leaderboard-table {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}
	
	.leaderboard-row {
		display: grid;
		grid-template-columns: 60px 80px 1fr auto;
		gap: var(--spacing-md);
		align-items: center;
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		transition: background-color 0.2s;
	}
	
	.leaderboard-row:hover {
		background-color: var(--color-surface);
	}
	
	.leaderboard-row.winner {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
	}
	
	.rank {
		font-size: 2rem;
		text-align: center;
	}
	
	.rank-number {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}
	
	.submission-preview img {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}
	
	.submission-info {
		min-width: 0;
	}
	
	.photographer {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-xs);
		text-decoration: none;
	}
	
	.photographer .avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		object-fit: cover;
	}
	
	.photographer span {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	.title {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.scores {
		display: flex;
		gap: var(--spacing-lg);
	}
	
	.score-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}
	
	.score-item .label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-weight: 500;
		text-transform: uppercase;
	}
	
	.score-item .value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	.score-item.total .value {
		font-size: 1.125rem;
		color: var(--color-primary);
	}
	
	@media (max-width: 768px) {
		.leaderboard-row {
			grid-template-columns: 50px 60px 1fr;
			gap: var(--spacing-sm);
		}
		
		.submission-preview img {
			width: 60px;
			height: 60px;
		}
		
		.scores {
			grid-column: 1 / -1;
			justify-content: space-around;
			padding-top: var(--spacing-sm);
			border-top: 1px solid var(--color-border);
		}
	}
</style>