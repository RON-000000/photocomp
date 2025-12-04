<script>
	import { formatDate } from '$lib/data/mockData';
	import { Trophy, ThumbsUp, Star } from 'lucide-svelte';

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
		<h3>
			<Trophy size={24} />
			<span>Leaderboard</span>
		</h3>
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
				<a href="/submissions/{entry._id}" class="leaderboard-row">
					<div class="rank" class:top-three={index < 3}>
						{#if index === 0}
							<Trophy size={32} class="gold" />
						{:else if index === 1}
							<Trophy size={28} class="silver" />
						{:else if index === 2}
							<Trophy size={24} class="bronze" />
						{:else}
							<span class="rank-number">#{index + 1}</span>
						{/if}
					</div>

					<div class="submission-preview">
						<img src={entry.imageUrl} alt={entry.title} />
					</div>

					<div class="submission-info">
						<div class="photographer">
							<img
								src={entry.user?.avatar || `https://i.pravatar.cc/150?u=${entry.userId}`}
								alt={entry.user?.username || entry.userId}
								class="avatar"
							/>
							<span>{entry.user?.username || entry.userId}</span>
						</div>
						<p class="title">{entry.title}</p>
					</div>

					<div class="scores">
						<div class="score-item">
							<span class="label">Community</span>
							<span class="value">
								<ThumbsUp size={14} />
								{entry.votes.community}
							</span>
						</div>
						<div class="score-item">
							<span class="label">Jury</span>
							<span class="value">
								<Star size={14} />
								{entry.votes.jury.toFixed(1)}
							</span>
						</div>
						<div class="score-item total">
							<span class="label">Total</span>
							<span class="value total-score">{entry.totalScore.toFixed(2)}</span>
						</div>
					</div>
				</a>
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
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin: 0;
		color: var(--color-text-primary);
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
		border: 1px solid transparent;
		transition: all 0.2s ease;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
	}

	.leaderboard-row:hover {
		background-color: var(--color-surface);
		border-color: var(--color-border);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.rank {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.rank.top-three :global(svg) {
		transition: transform 0.2s ease;
	}

	.leaderboard-row:hover .rank.top-three :global(svg) {
		transform: scale(1.1);
	}

	.rank :global(svg.gold) {
		color: #FFD700;
	}

	.rank :global(svg.silver) {
		color: #C0C0C0;
	}

	.rank :global(svg.bronze) {
		color: #CD7F32;
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
		gap: var(--spacing-xl);
	}

	.score-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
	}

	.score-item .label {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.score-item .value {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.score-item .value :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.score-item.total .value {
		font-size: 1.25rem;
		color: var(--color-primary);
		font-weight: 700;
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