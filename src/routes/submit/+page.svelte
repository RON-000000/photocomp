<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/stores/auth';
	import { getCompetitions, createSubmission } from '$lib/api.js';
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
	
	onMount(async () => {
		try {
			competitions = await getCompetitions('active');
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
		if (!$currentUser) {
			alert('Bitte logge dich ein!');
			return;
		}
		
		if (!selectedCompetition || !title || !description || !imageUrl) {
			alert('Bitte fülle alle Pflichtfelder aus und lade ein Bild hoch!');
			return;
		}
		
		isSubmitting = true;
		
		try {
			const metadata = {
				camera: camera || 'N/A',
				lens: lens || 'N/A',
				settings: settings || 'N/A'
			};
			
			await createSubmission({
				competitionId: selectedCompetition,
				userId: $currentUser._id,
				title,
				description,
				imageUrl,
				metadata
			});
			
			alert('✅ Submission erfolgreich eingereicht!');
			goto(`/competitions/${selectedCompetition}`);
		} catch (error) {
			alert('Fehler: ' + error.message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Foto einreichen - PhotoZürich</title>
</svelte:head>

<div class="container-sm">
	<div class="page-header">
		<h1>📸 Foto einreichen</h1>
		<p>Reiche dein Foto für einen Wettbewerb ein und zeige der Community dein Können!</p>
	</div>
	
	{#if loading}
		<div class="loading-state">
			<span class="loading"></span>
			<p>Lade Wettbewerbe...</p>
		</div>
	{:else if !$currentUser}
		<div class="login-prompt">
			<h3>Login erforderlich</h3>
			<p>Du musst eingeloggt sein, um Fotos einzureichen.</p>
			<button class="btn btn-primary">Login</button>
		</div>
	{:else}
		<form class="submit-form" on:submit|preventDefault={handleSubmit}>
			<!-- Competition Selection -->
			<div class="form-group">
				<label for="competition">Wettbewerb auswählen *</label>
				<select id="competition" bind:value={selectedCompetition} required>
					<option value="">-- Wähle einen Wettbewerb --</option>
					{#each competitions as competition}
						<option value={competition._id}>{competition.title}</option>
					{/each}
				</select>
				{#if competitions.length === 0}
					<small class="text-danger">Aktuell keine aktiven Wettbewerbe verfügbar.</small>
				{/if}
			</div>
			
			<div class="divider"></div>
			
			<!-- Image Upload -->
			<div class="form-group">
				<label>Bild hochladen * (max. 10MB, wird automatisch komprimiert)</label>
				<ImageUpload 
					onUploadComplete={handleImageUpload}
					currentImageUrl={imageUrl}
				/>
				<small>Erlaubte Formate: JPEG, PNG, WebP</small>
			</div>
			
			<!-- Title -->
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
			
			<!-- Description -->
			<div class="form-group">
				<label for="description">Beschreibung *</label>
				<textarea 
					id="description" 
					bind:value={description} 
					placeholder="Erzähle die Geschichte hinter deinem Foto..."
					rows="4"
					required
				></textarea>
			</div>
			
			<div class="divider"></div>
			
			<h3>📷 Technische Details (Optional)</h3>
			
			<!-- Camera -->
			<div class="form-group">
				<label for="camera">Kamera</label>
				<input 
					type="text" 
					id="camera" 
					bind:value={camera} 
					placeholder="z.B. Sony A7III"
				/>
			</div>
			
			<!-- Lens -->
			<div class="form-group">
				<label for="lens">Objektiv</label>
				<input 
					type="text" 
					id="lens" 
					bind:value={lens} 
					placeholder="z.B. 24-70mm f/2.8"
				/>
			</div>
			
			<!-- Settings -->
			<div class="form-group">
				<label for="settings">Einstellungen</label>
				<input 
					type="text" 
					id="settings" 
					bind:value={settings} 
					placeholder="z.B. f/2.8, 1/125s, ISO 800"
				/>
			</div>
			
			<div class="divider"></div>
			
			<!-- Submit Button -->
			<div class="form-actions">
				<button 
					type="submit" 
					class="btn btn-primary btn-lg" 
					disabled={isSubmitting || !imageUrl}
				>
					{#if isSubmitting}
						<span class="loading"></span>
						Wird eingereicht...
					{:else}
						Foto einreichen
					{/if}
				</button>
				<a href="/competitions" class="btn btn-secondary">Abbrechen</a>
			</div>
		</form>
	{/if}
</div>

<style>
	.page-header {
		text-align: center;
		margin-bottom: var(--spacing-2xl);
	}
	
	.page-header p {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		margin: 0;
	}
	
	.loading-state {
		text-align: center;
		padding: var(--spacing-3xl);
	}
	
	.loading-state p {
		margin-top: var(--spacing-md);
		color: var(--color-text-secondary);
	}
	
	.login-prompt {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-3xl);
		text-align: center;
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border);
	}
	
	.login-prompt h3 {
		margin-bottom: var(--spacing-md);
	}
	
	.login-prompt p {
		margin-bottom: var(--spacing-xl);
	}
	
	.submit-form {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border);
	}
	
	small {
		display: block;
		margin-top: var(--spacing-xs);
		color: var(--color-text-muted);
		font-size: 0.8125rem;
	}
	
	.text-danger {
		color: var(--color-danger);
	}
	
	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
	}
	
	.btn-lg {
		min-width: 200px;
	}
	
	.btn .loading {
		display: inline-block;
		margin-right: var(--spacing-sm);
	}
</style>