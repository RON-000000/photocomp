<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/stores/auth0';
	import { getCompetitions, createSubmission, deleteUploadedImage } from '$lib/api.js';
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let competitions = [];
	let selectedCompetition = $page.url.searchParams.get('competition') || '';
	let title = '';
	let description = '';
	let imageUrl = '';
	let camera = '';
	let lens = '';
	let settings = '';
	let isSubmitting = false;
	let loading = true;
	let submissionCreated = false; // Track if submission was successfully created

	onMount(async () => {
		try {
			const allCompetitions = await getCompetitions('active');
			// Filter nur Competitions, deren Deadline noch nicht abgelaufen ist
			const now = new Date();
			competitions = allCompetitions.filter(comp => {
				const deadline = new Date(comp.deadline);
				return deadline > now;
			});
		} catch (error) {
			console.error('Error loading competitions:', error);
		} finally {
			loading = false;
		}
	});
	
	function handleImageUpload(url) {
		imageUrl = url;
	}
	
async function handleSubmit() {
	if (!selectedCompetition || !imageUrl) {
		alert('Bitte wähle einen Wettbewerb und lade ein Bild hoch');
		return;
	}

	if (!$currentUser) {
		alert('Bitte logge dich ein!');
		return;
	}

	isSubmitting = true;

	try {
		const submissionData = {
			competitionId: selectedCompetition,
			userId: $currentUser._id,
			title: title,
			description: description,
			imageUrl: imageUrl,
			metadata: {
				camera: camera,
				lens: lens,
				settings: settings
			}
		};

		await createSubmission(submissionData);
		submissionCreated = true; // Mark as successfully created
		alert('Submission erfolgreich eingereicht! 🎉');

		// Reset form
		title = '';
		description = '';
		camera = '';
		lens = '';
		settings = '';
		selectedCompetition = '';
		imageUrl = '';

		goto('/competitions');
	} catch (error) {
		console.error('Submission error:', error);
		alert('Fehler beim Einreichen: ' + error.message);
	} finally {
		isSubmitting = false;
	}
}

	// Cleanup on component destroy (page navigation/refresh)
	onDestroy(async () => {
		// If there's an uploaded image but submission was not created, clean it up
		if (imageUrl && !submissionCreated) {
			try {
				await deleteUploadedImage(imageUrl);
			} catch (error) {
				console.error('Error cleaning up image:', error);
			}
		}
	});
</script>

<svelte:head>
	<title>Foto einreichen - PhotoZürich</title>
</svelte:head>

<div class="submit-page">
	<div class="container">
		<div class="page-header">
			<div>
				<h1>Foto einreichen</h1>
				<p>Reiche dein Foto für einen Wettbewerb ein und zeige der Community dein Können!</p>
			</div>
		</div>
	
	{#if loading}
		<div class="loading-state">
			<span class="loading"></span>
			<p>Lade Wettbewerbe...</p>
		</div>
	{:else if !$currentUser}
		<div class="login-prompt">
			<h3>Anmeldung erforderlich</h3>
			<p>Du musst eingeloggt sein, um Fotos einzureichen.</p>
			<button class="btn btn-primary">Anmelden</button>
		</div>
	{:else}
		<form class="submission-form" on:submit|preventDefault={handleSubmit}>
			<!-- Competition Selection -->
			<section class="form-section">
				<h2>Wettbewerb</h2>
				<div class="form-group">
					<label for="competition">Wettbewerb auswählen *</label>
					<select id="competition" bind:value={selectedCompetition} required>
						<option value="">-- Wähle einen Wettbewerb --</option>
						{#each competitions as competition}
							<option value={competition._id}>{competition.title}</option>
						{/each}
					</select>
					{#if competitions.length === 0}
						<span class="error-message">Aktuell keine aktiven Wettbewerbe verfügbar.</span>
					{/if}
				</div>
			</section>

			<!-- Image Upload -->
			<section class="form-section">
				<h2>Bild</h2>
				<div class="form-group">
					<label>Bild hochladen *</label>
					<ImageUpload
						onUploadComplete={handleImageUpload}
						currentImageUrl={imageUrl}
					/>
					<span class="help-text">Erlaubte Formate: JPEG, PNG, WebP (max. 100MB, wird komprimiert)</span>
				</div>
			</section>

			<!-- Basic Information -->
			<section class="form-section">
				<h2>Informationen</h2>

				<div class="form-group">
					<label for="title">Titel *</label>
					<input
						type="text"
						id="title"
						bind:value={title}
						placeholder="z.B. Limmat bei Nacht"
						maxlength="100"
						required
					/>
				</div>

				<div class="form-group">
					<label for="description">Beschreibung *</label>
					<textarea
						id="description"
						bind:value={description}
						placeholder="Erzähle die Geschichte hinter deinem Foto..."
						rows="5"
						required
					></textarea>
				</div>
			</section>

			<!-- Technical Details -->
			<section class="form-section">
				<h2>Technische Details (Optional)</h2>

				<div class="form-group">
					<label for="camera">Kamera</label>
					<input
						type="text"
						id="camera"
						bind:value={camera}
						placeholder="z.B. Sony A7III"
					/>
				</div>

				<div class="form-group">
					<label for="lens">Objektiv</label>
					<input
						type="text"
						id="lens"
						bind:value={lens}
						placeholder="z.B. 24-70mm f/2.8"
					/>
				</div>

				<div class="form-group">
					<label for="settings">Einstellungen</label>
					<input
						type="text"
						id="settings"
						bind:value={settings}
						placeholder="z.B. f/2.8, 1/125s, ISO 800"
					/>
				</div>
			</section>

			<!-- Submit Button -->
			<div class="form-actions">
				<a href="/competitions" class="btn btn-secondary">Abbrechen</a>
				<button
					type="submit"
					class="btn btn-primary"
					disabled={isSubmitting || !imageUrl}
				>
					{#if isSubmitting}
						<span class="loading"></span>
						<span>Wird eingereicht...</span>
					{:else}
						Foto einreichen
					{/if}
				</button>
			</div>
		</form>
	{/if}
	</div>
</div>

<style>
	.submit-page {
		min-height: calc(100vh - 60px);
		background: var(--color-surface);
		padding: var(--spacing-2xl) 0;
	}

	.page-header {
		margin-bottom: var(--spacing-2xl);
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 var(--spacing-sm) 0;
	}

	.page-header p {
		color: var(--color-text-secondary);
		margin: 0;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-4xl);
		gap: var(--spacing-lg);
	}

	.loading-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}

	.login-prompt {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-3xl);
		text-align: center;
		border: 1px solid var(--color-border);
	}

	.login-prompt h3 {
		margin-bottom: var(--spacing-md);
	}

	.login-prompt p {
		margin-bottom: var(--spacing-xl);
	}

	/* Form */
	.submission-form {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-2xl);
		max-width: 800px;
	}

	.form-section {
		margin-bottom: var(--spacing-2xl);
		padding-bottom: var(--spacing-2xl);
		border-bottom: 1px solid var(--color-border);
	}

	.form-section:last-of-type {
		border-bottom: none;
		margin-bottom: var(--spacing-xl);
	}

	.form-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 var(--spacing-md) 0;
	}

	/* Form Groups */
	.form-group {
		margin-bottom: var(--spacing-lg);
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		margin-bottom: var(--spacing-sm);
		color: var(--color-text-primary);
	}

	.form-group input[type="text"],
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		transition: border-color 0.2s;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.form-group textarea {
		resize: vertical;
	}

	.help-text {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-top: var(--spacing-xs);
	}

	.error-message {
		display: block;
		color: var(--color-danger);
		font-size: 0.75rem;
		margin-top: var(--spacing-xs);
	}

	/* Form Actions */
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-md);
		padding-top: var(--spacing-lg);
	}

	/* Mobile */
	@media (max-width: 768px) {
		.submission-form {
			padding: var(--spacing-lg);
		}

		.form-actions {
			flex-direction: column;
		}

		.form-actions button,
		.form-actions a {
			width: 100%;
		}
	}
</style>