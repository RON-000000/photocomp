<script>
	import { voteOnSubmission } from "$lib/api.js";
	import { currentUser } from "$lib/stores/auth0";

	export let submission;

	let hasVoted = false;
	let isVoting = false;
	let localVotes = submission.votes.community;

	async function handleVote() {
		if (!$currentUser) {
			alert("Bitte logge dich ein, um zu voten!");
			return;
		}

		if (hasVoted) {
			alert("Du hast bereits für diese Submission gevotet!");
			return;
		}

		isVoting = true;

		try {
			const result = await voteOnSubmission(submission._id);
			localVotes = result.votes.community;
			hasVoted = true;
		} catch (error) {
			alert("Fehler beim Voten: " + error.message);
		} finally {
			isVoting = false;
		}
	}
</script>

<div class="voting-panel">
	<h4>Abstimmen</h4>

	<div class="vote-section">
		<button
			class="vote-btn"
			class:voted={hasVoted}
			on:click={handleVote}
			disabled={hasVoted || isVoting}
		>
			<span class="icon">👍</span>
			<span class="count">{localVotes}</span>
		</button>

		<p class="vote-label">
			{#if hasVoted}
				✅ Danke für deine Stimme!
			{:else if isVoting}
				⏳ Wird gespeichert...
			{:else}
				Community Votes
			{/if}
		</p>
	</div>

	<div class="divider"></div>

	<div class="jury-section">
		<h5>Jury Bewertung</h5>
		<div class="jury-score">
			<span class="icon">⭐</span>
			<span class="score">{(submission.votes?.jury ?? 0).toFixed(1)}</span
			>
			<span class="max">/ 10</span>
		</div>

		{#if submission.juryFeedback}
			<p class="jury-feedback">{submission.juryFeedback}</p>
		{/if}
	</div>

	<div class="divider"></div>

	<div class="info-section">
		<p class="info-text">
			<strong>Hinweis:</strong> Community Votes (60%) und Jury Score (40%)
			werden kombiniert für das finale Ranking.
		</p>
	</div>
</div>

<style>
	.voting-panel {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border);
		position: sticky;
		top: 100px;
	}

	h4 {
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-primary);
	}

	.vote-section {
		text-align: center;
	}

	.vote-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		width: 100%;
		padding: var(--spacing-xl);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all 0.3s;
		font-size: 1rem;
	}

	.vote-btn:hover:not(:disabled) {
		background: #1d4ed8;
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.vote-btn:disabled {
		background: var(--color-success);
		cursor: not-allowed;
	}

	.vote-btn .icon {
		font-size: 3rem;
	}

	.vote-btn .count {
		font-size: 2rem;
		font-weight: 700;
	}

	.vote-label {
		margin-top: var(--spacing-md);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.divider {
		height: 1px;
		background: var(--color-border);
		margin: var(--spacing-xl) 0;
	}

	.jury-section {
		text-align: center;
	}

	h5 {
		font-size: 1rem;
		margin-bottom: var(--spacing-md);
		color: var(--color-text-primary);
	}

	.jury-score {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
	}

	.jury-score .icon {
		font-size: 2rem;
	}

	.jury-score .score {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.jury-score .max {
		font-size: 1.25rem;
		color: var(--color-text-muted);
	}

	.jury-feedback {
		font-size: 0.875rem;
		font-style: italic;
		color: var(--color-text-secondary);
		padding: var(--spacing-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}

	.info-section {
		padding: var(--spacing-md);
		background: #eff6ff;
		border-radius: var(--radius-md);
	}

	.info-text {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.6;
	}
</style>
