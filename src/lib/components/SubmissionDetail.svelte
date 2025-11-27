<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { currentUser } from '$lib/stores/auth0';
	import { voteOnSubmission, addCommentToSubmission, deleteSubmission, checkIfUserVoted } from '$lib/api.js';
	import { formatDate } from '$lib/data/mockData';
	import { 
		X, 
		Heart,
		Star, 
		MessageCircle, 
		Camera, 
		Trash2,
		Send,
		MoreHorizontal
	} from 'lucide-svelte';
	
	export let submission;
	export let competition;
	
	const dispatch = createEventDispatcher();
	
	let hasVoted = false;
	let isVoting = false;
	let isCheckingVote = true;
	let localVotes = submission.votes.community;
	let localComments = [...submission.comments];
	let commentText = '';
	let isSubmittingComment = false;
	let isDeleting = false;
	let showDeleteConfirm = false;
	
	$: canDelete = $currentUser && 
	               submission.userId === $currentUser._id && 
	               competition.status === 'active';
	
	onMount(async () => {
		if ($currentUser) {
			try {
				const result = await checkIfUserVoted(submission._id, $currentUser._id);
				hasVoted = result.hasVoted;
			} catch (error) {
				console.error('Error checking vote:', error);
			} finally {
				isCheckingVote = false;
			}
		} else {
			isCheckingVote = false;
		}
	});
	
	async function handleVote() {
		if (!$currentUser) {
			alert('Bitte logge dich ein, um zu voten!');
			return;
		}
		
		if (hasVoted) return;
		
		isVoting = true;
		
		try {
			const result = await voteOnSubmission(submission._id, $currentUser._id);
			localVotes = result.votes.community;
			hasVoted = true;
		} catch (error) {
			alert(error.message);
		} finally {
			isVoting = false;
		}
	}
	
	async function handleComment() {
		if (!$currentUser) {
			alert('Bitte logge dich ein, um zu kommentieren!');
			return;
		}
		
		if (!commentText.trim()) return;
		
		isSubmittingComment = true;
		
		try {
			const result = await addCommentToSubmission(submission._id, {
				userId: $currentUser._id,
				username: $currentUser.username,
				text: commentText
			});
			
			localComments = [...localComments, result.comment];
			commentText = '';
		} catch (error) {
			alert('Fehler: ' + error.message);
		} finally {
			isSubmittingComment = false;
		}
	}
	
	async function handleDelete() {
		isDeleting = true;
		
		try {
			await deleteSubmission(submission._id, $currentUser._id);
			dispatch('deleted');
		} catch (error) {
			alert('Fehler beim Löschen: ' + error.message);
		} finally {
			isDeleting = false;
			showDeleteConfirm = false;
		}
	}
	
	function handleClose() {
		dispatch('close');
	}
	
	function handleKeyPress(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleComment();
		}
	}
</script>

<div class="modal-wrapper">
	<!-- Header -->
	<div class="modal-header">
		<div class="header-user">
			<img 
				src="https://i.pravatar.cc/150?u={submission.userId}" 
				alt="User" 
				class="user-avatar" 
			/>
			<div class="user-info">
				<div class="user-name">{submission.userId}</div>
				<div class="location">{submission.metadata?.camera || 'Zürich'}</div>
			</div>
		</div>
		
		<div class="header-actions">
			{#if canDelete}
				<button 
					class="action-btn"
					on:click={() => showDeleteConfirm = !showDeleteConfirm}
				>
					<MoreHorizontal size={20} />
				</button>
			{/if}
			<button class="action-btn" on:click={handleClose}>
				<X size={24} />
			</button>
		</div>
	</div>
	
	{#if showDeleteConfirm}
		<div class="delete-confirm">
			<p>Möchtest du diese Submission wirklich löschen?</p>
			<div class="delete-actions">
				<button class="btn-confirm" on:click={handleDelete} disabled={isDeleting}>
					{#if isDeleting}
						<span class="loading"></span>
					{/if}
					Löschen
				</button>
				<button class="btn-cancel" on:click={() => showDeleteConfirm = false}>
					Abbrechen
				</button>
			</div>
		</div>
	{/if}
	
	<!-- Content -->
	<div class="modal-content">
		<!-- Image -->
		<div class="image-wrapper">
			<img src={submission.imageUrl} alt={submission.title} />
		</div>
		
		<!-- Actions Bar -->
		<div class="actions-bar">
			<div class="actions-left">
				<button 
					class="action-icon"
					class:liked={hasVoted}
					on:click={handleVote}
					disabled={isVoting || isCheckingVote}
				>
					<Heart size={28} fill={hasVoted ? 'currentColor' : 'none'} />
				</button>
				<button class="action-icon">
					<MessageCircle size={28} />
				</button>
			</div>
			<div class="actions-right">
				<div class="jury-badge">
					<Star size={16} fill="currentColor" />
					<span>{submission.votes.jury.toFixed(1)}</span>
				</div>
			</div>
		</div>
		
		<!-- Votes Count -->
		<div class="votes-count">
			<strong>{localVotes}</strong> {localVotes === 1 ? 'Vote' : 'Votes'}
		</div>
		
		<!-- Caption -->
		<div class="caption">
			<strong class="caption-author">{submission.userId}</strong>
			<span class="caption-title">{submission.title}</span>
			{#if submission.description}
				<p class="caption-text">{submission.description}</p>
			{/if}
		</div>
		
		<!-- Camera Info -->
		{#if submission.metadata?.camera && submission.metadata.camera !== 'N/A'}
			<div class="camera-info">
				<Camera size={14} />
				<span>{submission.metadata.camera}</span>
				{#if submission.metadata.settings && submission.metadata.settings !== 'N/A'}
					<span class="settings">{submission.metadata.settings}</span>
				{/if}
			</div>
		{/if}
		
		<!-- Timestamp -->
		<div class="timestamp">
			{formatDate(submission.createdAt)}
		</div>
		
		<!-- Comments Section -->
		<div class="comments-section">
			{#if localComments.length > 0}
				<div class="comments-list">
					{#each localComments as comment}
						<div class="comment">
							<img 
								src="https://i.pravatar.cc/150?u={comment.username}" 
								alt={comment.username}
								class="comment-avatar"
							/>
							<div class="comment-content">
								<div class="comment-text">
									<strong>{comment.username}</strong>
									{comment.text}
								</div>
								<div class="comment-meta">
									<span>{formatDate(comment.createdAt)}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="no-comments">
					<MessageCircle size={32} />
					<p>Noch keine Kommentare</p>
					<span>Sei der Erste der kommentiert!</span>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Comment Input -->
	<div class="comment-input-wrapper">
		{#if $currentUser}
			<img 
				src={$currentUser.avatar} 
				alt={$currentUser.name}
				class="input-avatar"
			/>
			<input
				type="text"
				bind:value={commentText}
				on:keypress={handleKeyPress}
				placeholder="Kommentar hinzufügen..."
				disabled={isSubmittingComment}
			/>
			<button
				class="send-btn"
				on:click={handleComment}
				disabled={!commentText.trim() || isSubmittingComment}
			>
				{#if isSubmittingComment}
					<span class="loading"></span>
				{:else}
					<Send size={20} />
				{/if}
			</button>
		{:else}
			<div class="login-required">
				<p>Logge dich ein, um zu kommentieren</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.modal-wrapper {
		position: relative;
		background: white;
		width: 100%;
		max-width: 480px;
		max-height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	/* Header */
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}
	
	.header-user {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}
	
	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}
	
	.user-info {
		display: flex;
		flex-direction: column;
	}
	
	.user-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.2;
	}
	
	.location {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	
	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}
	
	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		color: var(--color-text-primary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background 0.2s;
	}
	
	.action-btn:hover {
		background: var(--color-surface);
	}
	
	/* Delete Confirm */
	.delete-confirm {
		padding: var(--spacing-md);
		background: #fee2e2;
		border-bottom: 1px solid #fecaca;
		text-align: center;
	}
	
	.delete-confirm p {
		margin-bottom: var(--spacing-md);
		color: #991b1b;
		font-size: 0.875rem;
	}
	
	.delete-actions {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: center;
	}
	
	.btn-confirm,
	.btn-cancel {
		padding: var(--spacing-xs) var(--spacing-md);
		border: none;
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-confirm {
		background: var(--color-danger);
		color: white;
	}
	
	.btn-confirm:hover:not(:disabled) {
		background: #dc2626;
	}
	
	.btn-confirm:disabled {
		opacity: 0.5;
	}
	
	.btn-cancel {
		background: white;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}
	
	/* Content */
	.modal-content {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
	
	/* Image */
	.image-wrapper {
		width: 100%;
		aspect-ratio: 1 / 1;
		background: var(--color-surface);
		overflow: hidden;
	}
	
	.image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	/* Actions Bar */
	.actions-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) var(--spacing-md);
	}
	
	.actions-left {
		display: flex;
		gap: var(--spacing-md);
	}
	
	.action-icon {
		all: unset;
		cursor: pointer;
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	
	.action-icon:active {
		transform: scale(0.9);
	}
	
	.action-icon.liked {
		color: #ef4444;
		animation: like-bounce 0.5s ease;
	}
	
	@keyframes like-bounce {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.2); }
	}
	
	.jury-badge {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	.jury-badge :global(svg) {
		color: #fbbf24;
	}
	
	/* Votes Count */
	.votes-count {
		padding: 0 var(--spacing-md) var(--spacing-xs);
		font-size: 0.875rem;
		color: var(--color-text-primary);
	}
	
	.votes-count strong {
		font-weight: 600;
	}
	
	/* Caption */
	.caption {
		padding: 0 var(--spacing-md) var(--spacing-md);
	}
	
	.caption-author {
		font-weight: 600;
		margin-right: 0.25rem;
		color: var(--color-text-primary);
	}
	
	.caption-title {
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	.caption-text {
		margin-top: var(--spacing-xs);
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.6;
		white-space: pre-wrap;
	}
	
	/* Camera Info */
	.camera-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: 0 var(--spacing-md) var(--spacing-sm);
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}
	
	.camera-info :global(svg) {
		flex-shrink: 0;
	}
	
	.settings {
		margin-left: var(--spacing-xs);
	}
	
	/* Timestamp */
	.timestamp {
		padding: 0 var(--spacing-md) var(--spacing-md);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}
	
	/* Comments Section */
	.comments-section {
		border-top: 1px solid var(--color-border);
		padding: var(--spacing-md);
	}
	
	.comments-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}
	
	.comment {
		display: flex;
		gap: var(--spacing-sm);
	}
	
	.comment-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}
	
	.comment-content {
		flex: 1;
		min-width: 0;
	}
	
	.comment-text {
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-primary);
		word-wrap: break-word;
	}
	
	.comment-text strong {
		font-weight: 600;
		margin-right: 0.25rem;
	}
	
	.comment-meta {
		display: flex;
		gap: var(--spacing-md);
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	
	.no-comments {
		text-align: center;
		padding: var(--spacing-3xl) var(--spacing-md);
		color: var(--color-text-muted);
	}
	
	.no-comments :global(svg) {
		opacity: 0.3;
		margin-bottom: var(--spacing-md);
	}
	
	.no-comments p {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: var(--color-text-secondary);
	}
	
	.no-comments span {
		font-size: 0.875rem;
	}
	
	/* Comment Input */
	.comment-input-wrapper {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		border-top: 1px solid var(--color-border);
		background: white;
	}
	
	.input-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}
	
	.comment-input-wrapper input {
		flex: 1;
		border: none;
		padding: var(--spacing-sm);
		font-size: 0.9375rem;
		outline: none;
		background: transparent;
	}
	
	.comment-input-wrapper input::placeholder {
		color: var(--color-text-muted);
	}
	
	.send-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: transparent;
		color: var(--color-primary);
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: all 0.2s;
		flex-shrink: 0;
	}
	
	.send-btn:hover:not(:disabled) {
		background: var(--color-surface);
	}
	
	.send-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	
	.login-required {
		width: 100%;
		text-align: center;
		padding: var(--spacing-sm);
	}
	
	.login-required p {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 768px) {
		.modal-wrapper {
			max-width: 100%;
			border-radius: 0;
		}
	}
</style>