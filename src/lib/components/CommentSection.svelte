<script>
	import { addCommentToSubmission } from '$lib/api.js';
	import { currentUser } from '$lib/stores/auth0';
	import { formatDate } from '$lib/data/mockData';
	
	export let submission;
	
	let commentText = '';
	let isSubmitting = false;
	let localComments = [...submission.comments];
	
	async function handleSubmitComment() {
		if (!$currentUser) {
			alert('Bitte logge dich ein, um zu kommentieren!');
			return;
		}
		
		if (commentText.trim().length === 0) {
			alert('Bitte gib einen Kommentar ein!');
			return;
		}
		
		isSubmitting = true;
		
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
			isSubmitting = false;
		}
	}
</script>

<div class="comment-section">
	<h4>💬 Kommentare ({localComments.length})</h4>
	
	{#if $currentUser}
		<div class="comment-form">
			<img src={$currentUser.avatar} alt={$currentUser.name} class="user-avatar" />
			<div class="form-content">
				<textarea 
					bind:value={commentText}
					placeholder="Gib konstruktives Feedback..."
					rows="3"
					disabled={isSubmitting}
				></textarea>
				<button 
					class="btn btn-primary btn-sm" 
					on:click={handleSubmitComment}
					disabled={commentText.trim().length === 0 || isSubmitting}
				>
					{#if isSubmitting}
						<span class="loading"></span>
						Wird gesendet...
					{:else}
						Kommentar abschicken
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<div class="login-prompt">
			<p>Bitte logge dich ein, um Kommentare zu schreiben.</p>
			<button class="btn btn-primary btn-sm">Login</button>
		</div>
	{/if}
	
	<div class="comments-list">
		{#if localComments.length === 0}
			<p class="no-comments">Noch keine Kommentare. Sei der Erste! 🎉</p>
		{:else}
			{#each localComments as comment}
				<div class="comment">
					<img src="https://i.pravatar.cc/150?u={comment.username}" alt={comment.username} class="comment-avatar" />
					<div class="comment-content">
						<div class="comment-header">
							<a href="/profile/{comment.username}" class="comment-author">{comment.username}</a>
							<span class="comment-date">{formatDate(comment.createdAt)}</span>
						</div>
						<p class="comment-text">{comment.text}</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.comment-section {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border);
	}
	
	h4 {
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-primary);
	}
	
	.comment-form {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-xl);
		border-bottom: 1px solid var(--color-border);
	}
	
	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}
	
	.form-content {
		flex: 1;
	}
	
	.form-content textarea {
		width: 100%;
		margin-bottom: var(--spacing-md);
		resize: vertical;
		min-height: 80px;
	}
	
	.login-prompt {
		text-align: center;
		padding: var(--spacing-xl);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-xl);
	}
	
	.login-prompt p {
		margin-bottom: var(--spacing-md);
		color: var(--color-text-secondary);
	}
	
	.comments-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}
	
	.no-comments {
		text-align: center;
		padding: var(--spacing-xl);
		color: var(--color-text-muted);
		font-style: italic;
	}
	
	.comment {
		display: flex;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		transition: background-color 0.2s;
	}
	
	.comment:hover {
		background-color: var(--color-surface);
	}
	
	.comment-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}
	
	.comment-content {
		flex: 1;
	}
	
	.comment-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-xs);
	}
	
	.comment-author {
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-text-primary);
	}
	
	.comment-date {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	
	.comment-text {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.6;
	}
	
	.btn .loading {
		display: inline-block;
		margin-right: var(--spacing-xs);
	}
</style>