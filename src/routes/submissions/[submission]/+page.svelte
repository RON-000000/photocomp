<script>
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import {
		getSubmissionById,
		voteOnSubmission,
		addCommentToSubmission,
		checkIfUserVoted,
		deleteSubmission,
		getCompetitionById,
		deleteComment,
	} from "$lib/api.js";
	import { formatDate } from "$lib/data/mockData";
	import { currentUser } from "$lib/stores/auth0.js";
	import {
		ThumbsUp,
		Star,
		MessageCircle,
		Camera,
		Aperture,
		Calendar,
		User,
		Send,
		ArrowLeft,
		Trash2,
		Award,
	} from "lucide-svelte";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";

	let submission = null;
	let competition = null;
	let loading = true;
	let error = null;
	let hasVoted = false;
	let voting = false;
	let commentText = "";
	let submittingComment = false;
	let deleting = false;

	$: submissionId = $page.params.submission;
	$: canDelete =
		submission &&
		$currentUser &&
		competition &&
		(submission.userId === $currentUser._id ||
			submission.userId === $currentUser.sub) &&
		new Date(competition.deadline) > new Date();
	$: {
		if (submission && $currentUser && competition) {
			console.log("Debug canDelete:", {
				submissionUserId: submission.userId,
				currentUserId: $currentUser._id,
				canDelete: canDelete,
				deadline: competition.deadline,
				isBeforeDeadline: new Date(competition.deadline) > new Date(),
			});
		}
	}

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		error = null;

		try {
			submission = await getSubmissionById(submissionId);

			// Load competition to check deadline
			if (submission && submission.competitionId) {
				try {
					competition = await getCompetitionById(
						submission.competitionId,
					);
				} catch (err) {
					console.error("Error loading competition:", err);
				}
			}

			// Check if current user has voted
			if ($currentUser && submission) {
				try {
					const result = await checkIfUserVoted(
						submissionId,
						$currentUser._id,
					);
					hasVoted = result.hasVoted;
				} catch (err) {
					console.error("Error checking vote:", err);
				}
			}
		} catch (err) {
			error = err.message;
			console.error("Error loading submission:", err);
		} finally {
			loading = false;
		}
	}

	async function handleVote() {
		if (!$currentUser) {
			alert("Bitte logge dich ein, um zu voten!");
			return;
		}

		if (hasVoted) {
			alert("Du hast bereits für diese Submission gevotet!");
			return;
		}

		voting = true;

		try {
			await voteOnSubmission(submissionId, $currentUser._id);
			hasVoted = true;

			// Reload submission to get updated vote count
			submission = await getSubmissionById(submissionId);

			alert("Vote erfolgreich! ⭐");
		} catch (err) {
			console.error("Error voting:", err);
			alert("Fehler beim Voten: " + err.message);
		} finally {
			voting = false;
		}
	}

	async function handleCommentSubmit() {
		if (!$currentUser) {
			alert("Bitte logge dich ein, um zu kommentieren!");
			return;
		}

		if (!commentText.trim()) {
			alert("Bitte gib einen Kommentar ein!");
			return;
		}

		submittingComment = true;

		try {
			const commentData = {
				userId: $currentUser._id,
				username: $currentUser.username,
				text: commentText.trim(),
			};

			await addCommentToSubmission(submissionId, commentData);

			// Reload submission to get updated comments
			submission = await getSubmissionById(submissionId);
			commentText = "";

			alert("Kommentar erfolgreich hinzugefügt! 💬");
		} catch (err) {
			console.error("Error submitting comment:", err);
			alert("Fehler beim Kommentieren: " + err.message);
		} finally {
			submittingComment = false;
		}
	}

	async function handleDeleteComment(commentId) {
		if (!confirm("Kommentar wirklich löschen?")) return;

		try {
			await deleteComment(submissionId, commentId);
			// Reload submission to update comments
			submission = await getSubmissionById(submissionId);
			alert("Kommentar gelöscht.");
		} catch (err) {
			console.error("Error deleting comment:", err);
			alert("Fehler beim Löschen: " + err.message);
		}
	}

	async function handleDelete() {
		if (!$currentUser) {
			alert("Bitte logge dich ein!");
			return;
		}

		if (
			!confirm(
				"Möchtest du diese Submission wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
			)
		) {
			return;
		}

		deleting = true;

		try {
			await deleteSubmission(submissionId, $currentUser._id);
			alert("Submission erfolgreich gelöscht! 🗑️");
			goto(`/competitions/${submission.competitionId}`);
		} catch (err) {
			console.error("Error deleting submission:", err);
			alert("Fehler beim Löschen: " + err.message);
		} finally {
			deleting = false;
		}
	}

	function goBack() {
		if (window.history.length > 1) {
			history.back();
		} else {
			goto("/competitions");
		}
	}
</script>

<svelte:head>
	<title>{submission?.title || "Submission"} - PhotoZürich</title>
</svelte:head>

{#if loading}
	<div class="loading-state">
		<span class="loading"></span>
		<p>Lade Submission...</p>
	</div>
{:else if error}
	<div class="container">
		<div class="error-state">
			<h2>Fehler</h2>
			<p>{error}</p>
			<PrimaryButton on:click={goBack}>Zurück</PrimaryButton>
		</div>
	</div>
{:else if submission}
	<div class="container">
		<!-- Header with Back and Delete buttons -->
		<div class="header-actions">
			<button on:click={goBack} class="back-button">
				<ArrowLeft size={20} />
				<span>Zurück</span>
			</button>

			{#if canDelete}
				<button
					on:click={handleDelete}
					class="delete-button"
					disabled={deleting}
				>
					<Trash2 size={20} />
					<span>{deleting ? "Löschen..." : "Beitrag löschen"}</span>
				</button>
			{/if}
		</div>

		<div class="submission-detail">
			<!-- Image Section -->
			<div class="image-section">
				<img
					src={submission.imageUrl}
					alt={submission.title}
					class="main-image"
				/>
			</div>

			<!-- Content Section -->
			<div class="content-section">
				<!-- User Info -->
				<div class="user-header">
					<img
						src={submission.user?.avatar ||
							`https://i.pravatar.cc/150?u=${submission.userId}`}
						alt={submission.user?.username || "User"}
						class="user-avatar"
					/>
					<div class="user-info">
						<a
							href="/profile/{submission.user?.username ||
								submission.userId}"
							class="user-name"
							>{submission.user?.username || submission.userId}</a
						>
						<div class="submission-date">
							<Calendar size={14} />
							<span>{formatDate(submission.createdAt)}</span>
						</div>
					</div>
				</div>

				<!-- Title & Description -->
				<div class="submission-content">
					{#if competition}
						<a
							href="/competitions/{competition._id}"
							class="competition-link"
						>
							<Award size={16} />
							<span>{competition.title}</span>
						</a>
					{/if}
					<h1 class="title">{submission.title}</h1>
					<p class="description">{submission.description}</p>
				</div>

				<!-- Camera Info -->
				{#if submission.metadata?.camera && submission.metadata.camera !== "N/A"}
					<div class="camera-section">
						<h3 class="section-title">Kamera Informationen</h3>
						<div class="camera-info">
							<div class="info-item">
								<Camera size={16} />
								<span>{submission.metadata.camera}</span>
							</div>
							{#if submission.metadata.lens && submission.metadata.lens !== "N/A"}
								<div class="info-item">
									<Aperture size={16} />
									<span>{submission.metadata.lens}</span>
								</div>
							{/if}
							{#if submission.metadata.settings && submission.metadata.settings !== "N/A"}
								<div class="info-item">
									<Star size={16} />
									<span>{submission.metadata.settings}</span>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Stats & Vote Section -->
				<div class="stats-section">
					<div class="stats">
						<div class="stat-item">
							<ThumbsUp size={20} />
							<span class="stat-value"
								>{submission.votes?.community || 0}</span
							>
							<span class="stat-label">Community Votes</span>
						</div>
						<div class="stat-item">
							<Star size={20} />
							<span class="stat-value"
								>{submission.votes?.jury
									? submission.votes.jury.toFixed(1)
									: "0.0"}</span
							>
							<span class="stat-label">Jury Bewertung</span>
						</div>
						<div class="stat-item">
							<MessageCircle size={20} />
							<span class="stat-value"
								>{submission.comments?.length || 0}</span
							>
							<span class="stat-label">Kommentare</span>
						</div>
					</div>

					<!-- Vote Button -->
					<button
						class="vote-button"
						class:voted={hasVoted}
						disabled={!$currentUser || voting || hasVoted}
						on:click={handleVote}
					>
						<ThumbsUp size={20} />
						<span
							>{hasVoted
								? "Bereits gevotet"
								: voting
									? "Voting..."
									: "Vote für diese Submission"}</span
						>
					</button>
				</div>

				<!-- Comments Section -->
				<div class="comments-section">
					<h3 class="section-title">
						Kommentare ({submission.comments?.length || 0})
					</h3>

					<!-- Comment Form -->
					{#if $currentUser}
						<div class="comment-form">
							<textarea
								bind:value={commentText}
								placeholder="Schreibe einen Kommentar..."
								rows="3"
								disabled={submittingComment}
							></textarea>
							<div style="align-self: flex-end;">
								<PrimaryButton
									disabled={!commentText.trim() ||
										submittingComment}
									on:click={handleCommentSubmit}
								>
									<Send size={16} />
									<span
										>{submittingComment
											? "Senden..."
											: "Kommentar senden"}</span
									>
								</PrimaryButton>
							</div>
						</div>
					{:else}
						<div class="login-prompt">
							<p>Bitte logge dich ein, um zu kommentieren</p>
						</div>
					{/if}

					<!-- Comments List -->
					{#if submission.comments && submission.comments.length > 0}
						<div class="comments-list">
							{#each submission.comments as comment}
								<div class="comment">
									<div class="comment-header">
										<User size={16} />
										<span class="comment-author"
											>{comment.username}</span
										>
										<span class="comment-date"
											>{formatDate(
												comment.createdAt,
											)}</span
										>
									</div>
									<p class="comment-text">{comment.text}</p>
									{#if $currentUser && (comment.userId === $currentUser._id || $currentUser.role === "admin" || $currentUser.role === "jury")}
										<button
											class="delete-comment-btn"
											on:click={() =>
												handleDeleteComment(comment.id)}
											title="Kommentar löschen"
										>
											<Trash2 size={14} />
										</button>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="no-comments">
							<MessageCircle size={24} />
							<p>Noch keine Kommentare. Sei der Erste!</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--spacing-xl);
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		gap: var(--spacing-md);
	}

	.loading {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state {
		text-align: center;
		padding: var(--spacing-2xl);
	}

	.error-state h2 {
		color: var(--color-error);
		margin-bottom: var(--spacing-md);
	}

	.header-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		gap: var(--spacing-md);
	}

	.back-button {
		all: unset;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		color: var(--color-text-secondary);
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.back-button:hover {
		color: var(--color-primary);
		border-color: var(--color-primary);
		background: var(--color-surface);
	}

	.delete-button {
		all: unset;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		color: var(--color-text-secondary);
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.delete-button:hover:not(:disabled) {
		color: var(--color-primary);
		border-color: var(--color-primary);
		background: var(--color-surface);
	}

	.delete-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.submission-detail {
		display: grid;
		grid-template-columns: 1fr 500px;
		gap: var(--spacing-2xl);
		align-items: start;
	}

	.image-section {
		position: sticky;
		top: var(--spacing-xl);
	}

	.main-image {
		width: 100%;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		display: block;
	}

	.content-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.user-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.user-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		object-fit: cover;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.user-name {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.user-name:hover {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.submission-date {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.submission-content {
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.competition-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.875rem;
		color: var(--color-primary);
		text-decoration: none;
		margin-bottom: var(--spacing-sm);
		font-weight: 500;
	}

	.competition-link:hover {
		text-decoration: underline;
	}

	.title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-md) 0;
		line-height: 1.2;
	}

	.description {
		font-size: 1rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.camera-section {
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-md) 0;
	}

	.camera-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
	}

	.info-item :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.stats-section {
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.stats {
		display: flex;
		gap: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		flex: 1;
	}

	.stat-item :global(svg) {
		color: var(--color-text-muted);
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-align: center;
	}

	.vote-button {
		all: unset;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-md);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.vote-button:hover:not(:disabled) {
		background: var(--color-primary-dark);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.vote-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.vote-button.voted {
		background: var(--color-success);
	}

	.comments-section {
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.comment-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
	}

	.comment-form textarea {
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: inherit;
		font-size: 0.875rem;
		resize: vertical;
		transition: border-color 0.2s ease;
	}

	.comment-form textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.login-prompt {
		padding: var(--spacing-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		text-align: center;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-lg);
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.comment {
		padding: var(--spacing-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		position: relative;
	}

	.delete-comment-btn {
		position: absolute;
		top: var(--spacing-sm);
		right: var(--spacing-sm);
		background: none;
		border: none;
		padding: 4px;
		color: var(--color-text-muted);
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
	}

	.delete-comment-btn:hover {
		opacity: 1;
		color: var(--color-error);
	}

	.comment-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-sm);
		font-size: 0.875rem;
	}

	.comment-author {
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.comment-date {
		color: var(--color-text-muted);
		font-size: 0.75rem;
	}

	.comment-text {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
	}

	.no-comments {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-2xl);
		color: var(--color-text-muted);
	}

	/* Mobile Optimization */
	@media (max-width: 1024px) {
		.submission-detail {
			grid-template-columns: 1fr;
		}

		.image-section {
			position: static;
		}
	}

	@media (max-width: 640px) {
		.container {
			padding: var(--spacing-md);
		}

		.stats {
			flex-direction: column;
			gap: var(--spacing-md);
		}

		.stat-item {
			flex-direction: row;
			justify-content: flex-start;
		}

		.title {
			font-size: 1.5rem;
		}
	}
</style>
