<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth0.js';
	import { ChevronLeft, ChevronRight, Camera, Aperture, Info, Star } from 'lucide-svelte';
	import { formatDate } from '$lib/data/mockData';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import BackButton from '$lib/components/BackButton.svelte';

	let competition = null;
	let submissions = [];
	let currentIndex = 0;
	let loading = true;
	let error = null;
	let rating = 5;
	let comment = '';
	let saving = false;
	let showMetadata = false;
	let completingCompetition = false;

	$: competitionId = $page.params.id;
	$: currentSubmission = submissions[currentIndex];
	$: progress = submissions.length > 0 ? `${currentIndex + 1} / ${submissions.length}` : '0 / 0';
	$: isJury = $currentUser && ($currentUser.role === 'jury' || $currentUser.role === 'admin');
	$: isAdmin = $currentUser && $currentUser.role === 'admin';
	$: canCompleteCompetition = competition?.status === 'voting' && isJury;
	$: canEditRating = isAdmin || competition?.status !== 'completed';

	// Load rating when submission changes
	$: if (currentSubmission && $currentUser) {
		loadCurrentRating();
	}

	onMount(async () => {
		if (!$currentUser || !isJury) {
			goto('/jury');
			return;
		}

		await loadData();
	});

	async function loadData() {
		loading = true;
		error = null;

		try {
			// Load competition
			const compRes = await fetch(`/api/competitions/${competitionId}`);
			if (compRes.ok) {
				competition = await compRes.json();
			}

			// Load submissions for this competition
			const subsRes = await fetch(`/api/competitions/${competitionId}/submissions`);
			if (subsRes.ok) {
				submissions = await subsRes.json();
			}

			// Load existing jury ratings for current user
			if (currentSubmission) {
				await loadCurrentRating();
			}
		} catch (err) {
			error = err.message;
			console.error('Error loading evaluation data:', err);
		} finally {
			loading = false;
		}
	}

	async function loadCurrentRating() {
		if (!currentSubmission) return;

		try {
			const response = await fetch(`/api/jury/ratings/${currentSubmission._id}?jurorUsername=${$currentUser.username}`);
			if (response.ok) {
				const data = await response.json();
				if (data.rating) {
					rating = data.rating;
					comment = data.comment || '';
				} else {
					// Reset to defaults
					rating = 5;
					comment = '';
				}
			}
		} catch (err) {
			console.error('Error loading rating:', err);
		}
	}

	async function saveRating() {
		if (!currentSubmission) return;

		saving = true;

		try {
			const response = await fetch('/api/jury/ratings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					submissionId: currentSubmission._id,
					competitionId: competitionId,
					jurorUsername: $currentUser.username,
					rating: rating,
					comment: comment
				})
			});

			if (response.ok) {
				alert('Bewertung gespeichert! ⭐');
				// Move to next submission automatically
				if (currentIndex < submissions.length - 1) {
					goToNext();
				}
			} else {
				alert('Fehler beim Speichern der Bewertung');
			}
		} catch (err) {
			console.error('Error saving rating:', err);
			alert('Fehler beim Speichern der Bewertung');
		} finally {
			saving = false;
		}
	}

	async function goToNext() {
		if (currentIndex < submissions.length - 1) {
			currentIndex++;
			await loadCurrentRating();
		}
	}

	async function goToPrevious() {
		if (currentIndex > 0) {
			currentIndex--;
			await loadCurrentRating();
		}
	}

	async function goToSubmission(index) {
		currentIndex = index;
		await loadCurrentRating();
	}

	function goBack() {
		goto('/jury');
	}

	async function completeCompetition() {
		if (!confirm('Möchtest du diesen Wettbewerb wirklich beenden? Dies kann nicht rückgängig gemacht werden.')) {
			return;
		}

		completingCompetition = true;

		try {
			const response = await fetch(`/api/competitions/${competitionId}/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'completed' })
			});

			if (response.ok) {
				alert('Wettbewerb erfolgreich beendet!');
				goto('/jury');
			} else {
				alert('Fehler beim Beenden des Wettbewerbs');
			}
		} catch (err) {
			console.error('Error completing competition:', err);
			alert('Fehler beim Beenden des Wettbewerbs');
		} finally {
			completingCompetition = false;
		}
	}
</script>

<svelte:head>
	<title>Bewertung - {competition?.title || 'Competition'} - PhotoZürich</title>
</svelte:head>

{#if loading}
	<div class="loading-state">
		<span class="loading"></span>
		<p>Lade Bewertung...</p>
	</div>
{:else if error}
	<div class="container">
		<div class="error-state">
			<h2>Fehler</h2>
			<p>{error}</p>
			<button class="btn btn-primary" on:click={goBack}>Zurück zum Dashboard</button>
		</div>
	</div>
{:else if competition && currentSubmission}
	<div class="container">
		<!-- Header with Back Button and Complete Competition -->
		<div class="header-actions">
			<BackButton on:click={goBack} />
			<div class="header-right">
				<span class="progress">{progress}</span>
				{#if canCompleteCompetition}
					<PrimaryButton on:click={completeCompetition} disabled={completingCompetition}>
						{completingCompetition ? 'Wird beendet...' : 'Wettbewerb beenden'}
					</PrimaryButton>
				{/if}
			</div>
		</div>

		<div class="evaluation-detail">
			<!-- Image Section -->
			<div class="image-section">
				<div class="image-wrapper">
					<img
						src={currentSubmission.imageUrl}
						alt={currentSubmission.title}
						class="main-image"
					/>

					<!-- Navigation Buttons -->
					<button
						class="nav-btn nav-prev"
						on:click={goToPrevious}
						disabled={currentIndex === 0}
					>
						<ChevronLeft size={32} />
					</button>
					<button
						class="nav-btn nav-next"
						on:click={goToNext}
						disabled={currentIndex === submissions.length - 1}
					>
						<ChevronRight size={32} />
					</button>
				</div>

				<!-- Thumbnail Strip -->
				<div class="thumbnail-strip">
					{#each submissions as submission, index}
						<button
							class="thumbnail"
							class:active={index === currentIndex}
							on:click={() => goToSubmission(index)}
						>
							<img src={submission.imageUrl} alt={submission.title} />
							<span class="thumbnail-number">{index + 1}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Content Section -->
			<div class="content-section">
				<!-- Competition Info -->
				<div class="competition-header">
					<a href="/competitions/{competition._id}" class="competition-title-link">
						<h2 class="competition-title">{competition.title}</h2>
					</a>
					<p class="competition-theme">{competition.theme}</p>
				</div>

				<!-- Submission Info (Blind Booking - no user info) -->
				<div class="submission-info">
					<h1 class="title">{currentSubmission.title}</h1>
					<p class="description">{currentSubmission.description}</p>
				</div>

				<!-- Rating Section -->
				<div class="rating-section">
					<h3 class="section-title">Deine Bewertung</h3>

					{#if !canEditRating}
						<div class="competition-completed-notice">
							<p>Dieser Wettbewerb ist beendet. Bewertungen können nicht mehr geändert werden.</p>
						</div>
					{/if}

					<div class="rating-control">
						<div class="rating-header">
							<label for="rating-slider" class="rating-label">Bewertung</label>
							<span class="rating-value">{rating} / 10</span>
						</div>
						<input
							id="rating-slider"
							type="range"
							min="1"
							max="10"
							step="0.5"
							bind:value={rating}
							class="rating-slider"
							disabled={!canEditRating}
						/>
						<div class="rating-scale">
							<span>1</span>
							<span>5</span>
							<span>10</span>
						</div>
					</div>

					<div class="comment-control">
						<label for="comment-field" class="comment-label">
							Kommentar (Optional)
						</label>
						<textarea
							id="comment-field"
							bind:value={comment}
							placeholder="Interne Notizen zur Bewertung..."
							rows="4"
							class="comment-textarea"
							disabled={!canEditRating}
						></textarea>
					</div>

					<PrimaryButton on:click={saveRating} disabled={saving || !canEditRating} fullWidth={true}>
						{saving ? 'Speichern...' : 'Bewertung speichern'}
					</PrimaryButton>
				</div>

				<!-- Metadata Toggle -->
				{#if currentSubmission.metadata?.camera && currentSubmission.metadata.camera !== 'N/A'}
					<div class="metadata-section">
						<button
							class="metadata-toggle"
							on:click={() => showMetadata = !showMetadata}
						>
							<Info size={18} />
							<span>{showMetadata ? 'EXIF Daten verbergen' : 'EXIF Daten anzeigen'}</span>
						</button>

						{#if showMetadata}
							<div class="metadata-content">
								<h3 class="section-title">Kamera Informationen</h3>
								<div class="metadata-info">
									{#if currentSubmission.metadata.camera && currentSubmission.metadata.camera !== 'N/A'}
										<div class="info-item">
											<Camera size={16} />
											<span>{currentSubmission.metadata.camera}</span>
										</div>
									{/if}
									{#if currentSubmission.metadata.lens && currentSubmission.metadata.lens !== 'N/A'}
										<div class="info-item">
											<Aperture size={16} />
											<span>{currentSubmission.metadata.lens}</span>
										</div>
									{/if}
									{#if currentSubmission.metadata.settings && currentSubmission.metadata.settings !== 'N/A'}
										<div class="info-item">
											<Star size={16} />
											<span>{currentSubmission.metadata.settings}</span>
										</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Container */
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--spacing-xl);
	}

	/* Loading & Error States */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 60px);
		gap: var(--spacing-lg);
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
		to { transform: rotate(360deg); }
	}

	.error-state {
		text-align: center;
		padding: var(--spacing-4xl);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	/* Header Actions */
	.header-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		gap: var(--spacing-md);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.progress {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Main Layout */
	.evaluation-detail {
		display: grid;
		grid-template-columns: 1fr 500px;
		gap: var(--spacing-2xl);
		align-items: start;
	}

	/* Image Section */
	.image-section {
		position: sticky;
		top: var(--spacing-xl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.image-wrapper {
		position: relative;
	}

	.main-image {
		width: 100%;
		max-height: 70vh;
		object-fit: contain;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		display: block;
	}

	/* Navigation Buttons */
	.nav-btn {
		all: unset;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: var(--shadow-md);
	}

	.nav-prev {
		left: var(--spacing-md);
	}

	.nav-next {
		right: var(--spacing-md);
	}

	.nav-btn:hover:not(:disabled) {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
		transform: translateY(-50%) scale(1.1);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* Thumbnail Strip */
	.thumbnail-strip {
		display: flex;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm);
		background: white;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		overflow-x: auto;
	}

	.thumbnail {
		all: unset;
		position: relative;
		flex-shrink: 0;
		width: 80px;
		height: 60px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		cursor: pointer;
		border: 2px solid var(--color-border);
		transition: all 0.2s;
	}

	.thumbnail:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.thumbnail.active {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbnail-number {
		position: absolute;
		bottom: 4px;
		right: 4px;
		background: var(--color-primary);
		color: white;
		font-size: 0.625rem;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
	}

	/* Content Section */
	.content-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.competition-header {
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.competition-title-link {
		text-decoration: none;
		color: inherit;
		display: inline-block;
	}

	.competition-title-link:hover .competition-title {
		text-decoration: underline;
	}

	.competition-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-xs) 0;
	}

	.competition-theme {
		color: var(--color-text-secondary);
		margin: 0;
		font-size: 0.875rem;
	}

	.submission-info {
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-md) 0;
	}

	.description {
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin: 0;
	}

	/* Rating Section */
	.rating-section {
		padding: var(--spacing-xl);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.rating-control {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.rating-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.rating-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.rating-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.rating-slider {
		width: 100%;
		height: 8px;
		border-radius: var(--radius-sm);
		background: var(--color-border);
		outline: none;
		-webkit-appearance: none;
		appearance: none;
	}

	.rating-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 2px solid white;
		box-shadow: var(--shadow-md);
	}

	.rating-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 2px solid white;
		box-shadow: var(--shadow-md);
	}

	.rating-scale {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		padding: 0 var(--spacing-xs);
	}

	.comment-control {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.comment-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.comment-textarea {
		width: 100%;
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: var(--font-sans);
		font-size: 0.875rem;
		color: var(--color-text-primary);
		resize: vertical;
		transition: all 0.2s;
	}

	.comment-textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
	}

	.comment-textarea:disabled,
	.rating-slider:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.competition-completed-notice {
		padding: var(--spacing-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
	}

	.competition-completed-notice p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		text-align: center;
	}

	/* Metadata Section */
	.metadata-section {
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.metadata-toggle {
		all: unset;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: color 0.2s;
	}

	.metadata-toggle:hover {
		color: var(--color-primary);
	}

	.metadata-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--color-border);
	}

	.metadata-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.info-item :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	/* Mobile Optimization */
	@media (max-width: 1024px) {
		.evaluation-detail {
			grid-template-columns: 1fr;
		}

		.image-section {
			position: static;
		}
	}

	@media (max-width: 640px) {
		.header-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.header-right {
			justify-content: space-between;
		}

		.nav-btn {
			width: 40px;
			height: 40px;
		}

		.nav-prev {
			left: var(--spacing-xs);
		}

		.nav-next {
			right: var(--spacing-xs);
		}

		.thumbnail {
			width: 60px;
			height: 45px;
		}
	}
</style>
