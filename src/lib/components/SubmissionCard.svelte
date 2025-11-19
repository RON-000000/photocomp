<script>
	import { ThumbsUp, Star, MessageCircle, Camera, Aperture } from 'lucide-svelte';
	import { formatDate } from '$lib/data/mockData';
	
	export let submission;
	export let showVoting = false;
	export let onClick = null;
	
	function handleClick() {
		if (onClick) {
			onClick();
		}
	}
</script>

<button class="submission-card" on:click={handleClick}>
	<!-- Image -->
	<div class="image-wrapper">
		<img src={submission.imageUrl} alt={submission.title} />
	</div>
	
	<!-- Content -->
	<div class="card-content">
		<!-- User Info -->
		<div class="user-info">
			<img 
				src="https://i.pravatar.cc/150?u={submission.userId}" 
				alt="User" 
				class="user-avatar" 
			/>
			<div class="user-details">
				<div class="user-name">{submission.userId}</div>
				<div class="submission-date">{formatDate(submission.createdAt)}</div>
			</div>
		</div>
		
		<!-- Title & Description -->
		<h3 class="title">{submission.title}</h3>
		<p class="description">{submission.description}</p>
		
		<!-- Camera Info -->
		{#if submission.metadata?.camera && submission.metadata.camera !== 'N/A'}
			<div class="camera-info">
				<Camera size={14} />
				<span>{submission.metadata.camera}</span>
				{#if submission.metadata.settings && submission.metadata.settings !== 'N/A'}
					<Aperture size={14} />
					<span>{submission.metadata.settings}</span>
				{/if}
			</div>
		{/if}
		
		<!-- Stats -->
		<div class="stats">
			<div class="stat-item">
				<ThumbsUp size={16} />
				<span class="stat-value">{submission.votes?.community || 0}</span>
				<span class="stat-label">Votes</span>
			</div>
			<div class="stat-item">
				<Star size={16} />
				<span class="stat-value">{submission.votes?.jury ? submission.votes.jury.toFixed(1) : '0.0'}</span>
				<span class="stat-label">Jury</span>
			</div>
			<div class="stat-item">
				<MessageCircle size={16} />
				<span class="stat-value">{submission.comments?.length || 0}</span>
				<span class="stat-label">Kommentare</span>
			</div>
		</div>
	</div>
</button>

<style>
	.submission-card {
		all: unset;
		display: block;
		background: white;
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--color-border);
		transition: all 0.3s ease;
		cursor: pointer;
		width: 100%;
	}
	
	.submission-card:hover {
		border-color: var(--color-primary);
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
	}
	
	.image-wrapper {
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: var(--color-surface);
	}
	
	.image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s ease;
	}
	
	.submission-card:hover .image-wrapper img {
		transform: scale(1.05);
	}
	
	.card-content {
		padding: var(--spacing-lg);
	}
	
	.user-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
	}
	
	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		object-fit: cover;
	}
	
	.user-details {
		display: flex;
		flex-direction: column;
	}
	
	.user-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	.submission-date {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	
	.title {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: var(--spacing-xs);
		color: var(--color-text-primary);
		line-height: 1.3;
	}
	
	.description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.camera-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-md);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		width: fit-content;
	}
	
	.camera-info :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
	
	.stats {
		display: flex;
		gap: var(--spacing-lg);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--color-border);
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	
	.stat-item :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
	
	.stat-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	
	/* Mobile Optimization */
	@media (max-width: 640px) {
		.card-content {
			padding: var(--spacing-md);
		}
		
		.stats {
			flex-wrap: wrap;
			gap: var(--spacing-md);
		}
		
		.stat-item {
			font-size: 0.8125rem;
		}
	}
</style>