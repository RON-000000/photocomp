<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, isAuthenticated } from '$lib/stores/auth0';
	import { createCompetition, uploadImage } from '$lib/api.js';
	import { Trophy, Calendar, Image, Users, Plus, X, Upload, Search } from 'lucide-svelte';

	let loading = false;
	let uploadingImage = false;
	let juryMembers = [];
	let allUsers = [];
	let jurySearchQuery = '';
	let heroImageFile = null;
	let heroImagePreview = null;

	// Form data
	let formData = {
		title: '',
		description: '',
		theme: '',
		startDate: '',
		deadline: '',
		imageUrl: '',
		prizes: [''],
		rules: [''],
		juryMembers: [],
		votingWeight: {
			community: 0.5,
			jury: 0.5
		}
	};

	let errors = {};

	onMount(async () => {
		// Check if user is admin
		if (!$isAuthenticated || $currentUser?.role !== 'admin') {
			goto('/admin');
			return;
		}

		// Load all users for jury selection
		try {
			const response = await fetch('/api/admin/users');
			if (response.ok) {
				allUsers = await response.json();
				juryMembers = allUsers.filter(u => u.role === 'jury' || u.role === 'admin');
			}
		} catch (error) {
			console.error('Error loading users:', error);
		}
	});

	function addPrize() {
		formData.prizes = [...formData.prizes, ''];
	}

	function removePrize(index) {
		formData.prizes = formData.prizes.filter((_, i) => i !== index);
	}

	function addRule() {
		formData.rules = [...formData.rules, ''];
	}

	function removeRule(index) {
		formData.rules = formData.rules.filter((_, i) => i !== index);
	}

	function toggleJuryMember(username) {
		if (formData.juryMembers.includes(username)) {
			formData.juryMembers = formData.juryMembers.filter(u => u !== username);
		} else {
			formData.juryMembers = [...formData.juryMembers, username];
		}
	}

	// Filter jury members based on search query
	$: filteredJuryMembers = juryMembers.filter(user => {
		if (!jurySearchQuery) return true;
		const query = jurySearchQuery.toLowerCase();
		return (
			user.name?.toLowerCase().includes(query) ||
			user.username?.toLowerCase().includes(query) ||
			user.email?.toLowerCase().includes(query)
		);
	});

	// Hero image upload
	async function handleImageSelect(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			alert('Ungültiger Dateityp! Nur JPEG, PNG und WebP erlaubt.');
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			alert('Bild ist zu groß. Maximum 10MB erlaubt.');
			return;
		}

		heroImageFile = file;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			heroImagePreview = e.target.result;
		};
		reader.readAsDataURL(file);

		// Upload immediately after selection
		await uploadHeroImage();
	}

	function removeHeroImage() {
		heroImageFile = null;
		heroImagePreview = null;
		formData.imageUrl = '';
	}

	async function uploadHeroImage() {
		if (!heroImageFile) return;

		uploadingImage = true;
		try {
			const result = await uploadImage(heroImageFile, 'competitions');
			// Check both possible response formats
			formData.imageUrl = result.imageUrl || result.url;
			console.log('Upload successful, URL:', formData.imageUrl);
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('Fehler beim Hochladen des Bildes: ' + error.message);
			// Reset on error
			heroImageFile = null;
			heroImagePreview = null;
		} finally {
			uploadingImage = false;
		}
	}

	function validateForm() {
		errors = {};

		if (!formData.title.trim()) {
			errors.title = 'Titel ist erforderlich';
		}

		if (!formData.description.trim()) {
			errors.description = 'Beschreibung ist erforderlich';
		}

		if (!formData.theme.trim()) {
			errors.theme = 'Thema ist erforderlich';
		}

		if (!formData.startDate) {
			errors.startDate = 'Startdatum ist erforderlich';
		}

		if (!formData.deadline) {
			errors.deadline = 'Deadline ist erforderlich';
		}

		if (formData.startDate && formData.deadline && new Date(formData.startDate) >= new Date(formData.deadline)) {
			errors.deadline = 'Deadline muss nach dem Startdatum liegen';
		}

		const totalWeight = formData.votingWeight.community + formData.votingWeight.jury;
		if (Math.abs(totalWeight - 1) > 0.01) {
			errors.votingWeight = 'Voting-Gewichte müssen zusammen 1.0 ergeben';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(event) {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		loading = true;

		try {
			// Clean up empty prizes and rules
			const cleanedData = {
				...formData,
				prizes: formData.prizes.filter(p => p.trim()),
				rules: formData.rules.filter(r => r.trim())
			};

			const competition = await createCompetition(cleanedData);
			alert('Wettbewerb erfolgreich erstellt!');
			goto(`/competitions/${competition._id}`);
		} catch (error) {
			console.error('Error creating competition:', error);
			alert(`Fehler beim Erstellen: ${error.message || 'Unbekannter Fehler'}`);
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		if (confirm('Möchten Sie den Vorgang abbrechen? Alle Änderungen gehen verloren.')) {
			goto('/admin');
		}
	}
</script>

<div class="create-page">
	<div class="container">
		<header class="page-header">
			<div>
				<h1>Wettbewerb erstellen</h1>
				<p>Erstellen Sie einen neuen Fotografie-Wettbewerb</p>
			</div>
			<button class="btn btn-secondary" on:click={handleCancel} disabled={loading}>
				Abbrechen
			</button>
		</header>

		<form class="competition-form" on:submit={handleSubmit}>
			<!-- Basic Information -->
			<section class="form-section">
				<h2>Grundinformationen</h2>

				<div class="form-group">
					<label for="title">
						<Trophy size={18} />
						<span>Titel *</span>
					</label>
					<input
						id="title"
						type="text"
						bind:value={formData.title}
						placeholder="z.B. Zürich bei Nacht"
						class:error={errors.title}
						required
					/>
					{#if errors.title}
						<span class="error-message">{errors.title}</span>
					{/if}
				</div>

				<div class="form-group">
					<label for="theme">
						<Image size={18} />
						<span>Thema *</span>
					</label>
					<input
						id="theme"
						type="text"
						bind:value={formData.theme}
						placeholder="z.B. Urban Photography, Nachtaufnahmen"
						class:error={errors.theme}
						required
					/>
					{#if errors.theme}
						<span class="error-message">{errors.theme}</span>
					{/if}
				</div>

				<div class="form-group">
					<label for="description">
						Beschreibung *
					</label>
					<textarea
						id="description"
						bind:value={formData.description}
						placeholder="Beschreiben Sie den Wettbewerb..."
						rows="5"
						class:error={errors.description}
						required
					></textarea>
					{#if errors.description}
						<span class="error-message">{errors.description}</span>
					{/if}
				</div>

				<div class="form-group">
					<label>
						<Upload size={18} />
						<span>Hero-Bild</span>
					</label>

					{#if heroImagePreview}
						<div class="image-preview">
							<img src={heroImagePreview} alt="Hero-Bild Vorschau" />
							<div class="image-preview-actions">
								{#if uploadingImage}
									<div class="upload-status">
										<span class="loading-small"></span>
										<span>Wird hochgeladen...</span>
									</div>
								{:else if formData.imageUrl}
									<span class="upload-success">✓ Erfolgreich hochgeladen</span>
								{/if}
								<button
									type="button"
									class="btn btn-secondary btn-sm"
									on:click={removeHeroImage}
									disabled={uploadingImage}
								>
									<X size={16} />
									<span>Entfernen</span>
								</button>
							</div>
						</div>
					{:else}
						<label class="image-upload-area">
							<input
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/webp"
								on:change={handleImageSelect}
								style="display: none;"
							/>
							<div class="upload-placeholder">
								<Upload size={32} />
								<p>Klicken Sie hier, um ein Bild auszuwählen</p>
								<span class="help-text">JPEG, PNG oder WebP (max 10MB)</span>
								<span class="help-text">Bild wird automatisch komprimiert und hochgeladen</span>
							</div>
						</label>
					{/if}

					{#if formData.imageUrl}
						<div class="image-url-display">
							<span class="help-text">Cloudinary URL: {formData.imageUrl.substring(0, 50)}...</span>
						</div>
					{/if}

					<span class="help-text">Optionales Titelbild für den Wettbewerb</span>
				</div>
			</section>

			<!-- Dates -->
			<section class="form-section">
				<h2>Termine</h2>

				<div class="form-row">
					<div class="form-group">
						<label for="startDate">
							<Calendar size={18} />
							<span>Startdatum *</span>
						</label>
						<input
							id="startDate"
							type="date"
							bind:value={formData.startDate}
							class:error={errors.startDate}
							required
						/>
						{#if errors.startDate}
							<span class="error-message">{errors.startDate}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="deadline">
							<Calendar size={18} />
							<span>Deadline *</span>
						</label>
						<input
							id="deadline"
							type="date"
							bind:value={formData.deadline}
							class:error={errors.deadline}
							required
						/>
						{#if errors.deadline}
							<span class="error-message">{errors.deadline}</span>
						{/if}
					</div>
				</div>
			</section>

			<!-- Prizes -->
			<section class="form-section">
				<h2>Preise</h2>

				{#each formData.prizes as prize, index}
					<div class="form-group-with-remove">
						<input
							type="text"
							bind:value={formData.prizes[index]}
							placeholder="z.B. 1. Platz: CHF 500"
						/>
						{#if formData.prizes.length > 1}
							<button
								type="button"
								class="btn-remove"
								on:click={() => removePrize(index)}
								aria-label="Preis entfernen"
							>
								<X size={18} />
							</button>
						{/if}
					</div>
				{/each}

				<button type="button" class="btn btn-secondary btn-add" on:click={addPrize}>
					<Plus size={18} />
					<span>Preis hinzufügen</span>
				</button>
			</section>

			<!-- Rules -->
			<section class="form-section">
				<h2>Regeln</h2>

				{#each formData.rules as rule, index}
					<div class="form-group-with-remove">
						<input
							type="text"
							bind:value={formData.rules[index]}
							placeholder="z.B. Nur Original-Fotos erlaubt"
						/>
						{#if formData.rules.length > 1}
							<button
								type="button"
								class="btn-remove"
								on:click={() => removeRule(index)}
								aria-label="Regel entfernen"
							>
								<X size={18} />
							</button>
						{/if}
					</div>
				{/each}

				<button type="button" class="btn btn-secondary btn-add" on:click={addRule}>
					<Plus size={18} />
					<span>Regel hinzufügen</span>
				</button>
			</section>

			<!-- Jury Selection -->
			<section class="form-section">
				<h2>Jury-Mitglieder</h2>
				<p class="section-description">Wählen Sie Benutzer aus, die als Jury fungieren sollen</p>

				{#if juryMembers.length > 0}
					<!-- Jury Search -->
					<div class="jury-search-box">
						<Search size={20} />
						<input
							type="text"
							placeholder="Jury-Mitglieder durchsuchen..."
							bind:value={jurySearchQuery}
							class="jury-search-input"
						/>
						{#if jurySearchQuery}
							<button
								type="button"
								class="clear-jury-search"
								on:click={() => jurySearchQuery = ''}
								aria-label="Suche löschen"
							>
								×
							</button>
						{/if}
					</div>

					<!-- Selected count -->
					{#if formData.juryMembers.length > 0}
						<div class="jury-selected-count">
							{formData.juryMembers.length} Jury-Mitglied{formData.juryMembers.length !== 1 ? 'er' : ''} ausgewählt
						</div>
					{/if}

					<!-- Jury Grid -->
					{#if filteredJuryMembers.length === 0}
						<div class="no-results">
							<p>Keine Jury-Mitglieder gefunden für "{jurySearchQuery}"</p>
						</div>
					{:else}
						<div class="jury-grid">
							{#each filteredJuryMembers as user}
								<label class="jury-checkbox">
									<input
										type="checkbox"
										checked={formData.juryMembers.includes(user.username)}
										on:change={() => toggleJuryMember(user.username)}
									/>
									<div class="jury-user">
										<img src={user.avatar} alt={user.name} class="jury-avatar" />
										<div class="jury-info">
											<div class="jury-name">{user.name}</div>
											<div class="jury-username">@{user.username}</div>
										</div>
										<span class="role-badge role-{user.role}">
											{user.role}
										</span>
									</div>
								</label>
							{/each}
						</div>
					{/if}
				{:else}
					<p class="no-jury-message">
						Keine Jury-Mitglieder verfügbar. Weisen Sie Benutzern die Rolle "Jury" oder "Admin" zu.
					</p>
				{/if}
			</section>

			<!-- Voting Weight -->
			<section class="form-section">
				<h2>Voting-Gewichtung</h2>
				<p class="section-description">Wie sollen Community- und Jury-Votes gewichtet werden?</p>

				<div class="voting-weights">
					<div class="form-group">
						<label for="communityWeight">
							<Users size={18} />
							<span>Community-Gewicht</span>
						</label>
						<input
							id="communityWeight"
							type="number"
							min="0"
							max="1"
							step="0.1"
							bind:value={formData.votingWeight.community}
							class:error={errors.votingWeight}
						/>
						<span class="weight-percentage">{(formData.votingWeight.community * 100).toFixed(0)}%</span>
					</div>

					<div class="form-group">
						<label for="juryWeight">
							<Trophy size={18} />
							<span>Jury-Gewicht</span>
						</label>
						<input
							id="juryWeight"
							type="number"
							min="0"
							max="1"
							step="0.1"
							bind:value={formData.votingWeight.jury}
							class:error={errors.votingWeight}
						/>
						<span class="weight-percentage">{(formData.votingWeight.jury * 100).toFixed(0)}%</span>
					</div>
				</div>

				{#if errors.votingWeight}
					<span class="error-message">{errors.votingWeight}</span>
				{/if}

				<div class="weight-total" class:error={errors.votingWeight}>
					Gesamt: {((formData.votingWeight.community + formData.votingWeight.jury) * 100).toFixed(0)}%
					{#if Math.abs(formData.votingWeight.community + formData.votingWeight.jury - 1) < 0.01}
						✓
					{:else}
						(muss 100% ergeben)
					{/if}
				</div>
			</section>

			<!-- Submit -->
			<div class="form-actions">
				<button type="button" class="btn btn-secondary" on:click={handleCancel} disabled={loading}>
					Abbrechen
				</button>
				<button type="submit" class="btn btn-primary" disabled={loading}>
					{#if loading}
						<span class="loading"></span>
						<span>Wird erstellt...</span>
					{:else}
						<Trophy size={20} />
						<span>Wettbewerb erstellen</span>
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.create-page {
		min-height: calc(100vh - 60px);
		background: var(--color-surface);
		padding: var(--spacing-2xl) 0;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-2xl);
		gap: var(--spacing-lg);
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

	/* Form */
	.competition-form {
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

	.section-description {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		margin: 0 0 var(--spacing-lg) 0;
	}

	/* Form Groups */
	.form-group {
		margin-bottom: var(--spacing-lg);
	}

	.form-group label {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-weight: 500;
		margin-bottom: var(--spacing-sm);
		color: var(--color-text-primary);
	}

	.form-group label :global(svg) {
		color: var(--color-text-secondary);
	}

	.form-group input[type="text"],
	.form-group input[type="url"],
	.form-group input[type="date"],
	.form-group input[type="number"],
	.form-group textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.form-group input.error,
	.form-group textarea.error {
		border-color: var(--color-danger);
	}

	.form-group textarea {
		resize: vertical;
		font-family: inherit;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
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

	/* Dynamic Fields */
	.form-group-with-remove {
		display: flex;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

	.form-group-with-remove input {
		flex: 1;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
	}

	.btn-remove {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-sm);
		cursor: pointer;
		color: var(--color-danger);
		transition: all 0.2s;
	}

	.btn-remove:hover {
		background: var(--color-danger);
		color: white;
		border-color: var(--color-danger);
	}

	.btn-add {
		margin-top: var(--spacing-sm);
	}

	.btn-sm {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 0.875rem;
	}

	/* Image Upload */
	.image-upload-area {
		display: block;
		cursor: pointer;
	}

	.upload-placeholder {
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-2xl);
		text-align: center;
		transition: all 0.2s;
		background: var(--color-surface);
	}

	.upload-placeholder:hover {
		border-color: var(--color-accent);
		background: rgba(59, 130, 246, 0.05);
	}

	.upload-placeholder :global(svg) {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.upload-placeholder p {
		margin: 0 0 var(--spacing-xs) 0;
		font-weight: 500;
	}

	.image-preview {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		margin-bottom: var(--spacing-sm);
	}

	.image-preview img {
		width: 100%;
		height: 300px;
		object-fit: cover;
		display: block;
	}

	.image-preview-actions {
		padding: var(--spacing-md);
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
		background: var(--color-surface);
	}

	.upload-success {
		color: var(--color-success);
		font-weight: 500;
		font-size: 0.875rem;
	}

	.upload-status {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.loading-small {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	.image-url-display {
		margin-top: var(--spacing-xs);
		padding: var(--spacing-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		word-break: break-all;
	}

	/* Jury Selection */
	.jury-search-box {
		position: relative;
		display: flex;
		align-items: center;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-sm) var(--spacing-md);
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
	}

	.jury-search-box :global(svg) {
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.jury-search-input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 0.875rem;
		background: transparent;
	}

	.jury-search-input::placeholder {
		color: var(--color-text-secondary);
	}

	.clear-jury-search {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.clear-jury-search:hover {
		background: var(--color-surface);
		color: var(--color-text-primary);
	}

	.jury-selected-count {
		padding: var(--spacing-sm) var(--spacing-md);
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: var(--radius-sm);
		color: var(--color-accent);
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: var(--spacing-lg);
		text-align: center;
	}

	.jury-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-md);
	}

	.jury-checkbox {
		display: block;
		cursor: pointer;
	}

	.jury-checkbox input[type="checkbox"] {
		display: none;
	}

	.jury-user {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: all 0.2s;
	}

	.jury-checkbox input:checked + .jury-user {
		border-color: var(--color-accent);
		background: rgba(59, 130, 246, 0.05);
	}

	.jury-checkbox:hover .jury-user {
		border-color: var(--color-accent);
	}

	.jury-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.jury-info {
		flex: 1;
		min-width: 0;
	}

	.jury-name {
		font-weight: 500;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.jury-username {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.role-badge {
		margin-left: auto;
		display: inline-block;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.role-jury {
		background: #fef3c7;
		color: #92400e;
	}

	.role-admin {
		background: #fee2e2;
		color: #991b1b;
	}

	.no-jury-message {
		color: var(--color-text-secondary);
		text-align: center;
		padding: var(--spacing-xl);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		margin: 0;
	}

	.no-results {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-xl);
		text-align: center;
	}

	.no-results p {
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Voting Weights */
	.voting-weights {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
	}

	.weight-percentage {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-top: var(--spacing-xs);
	}

	.weight-total {
		margin-top: var(--spacing-md);
		padding: var(--spacing-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		text-align: center;
		font-weight: 500;
	}

	.weight-total.error {
		background: #fee2e2;
		color: var(--color-danger);
	}

	/* Form Actions */
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-md);
		padding-top: var(--spacing-lg);
	}

	/* Animations */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Mobile */
	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.competition-form {
			padding: var(--spacing-lg);
		}

		.form-row,
		.voting-weights {
			grid-template-columns: 1fr;
		}

		.jury-grid {
			grid-template-columns: 1fr;
		}

		.image-preview-actions {
			flex-direction: column;
		}

		.image-preview-actions button {
			width: 100%;
		}

		.form-actions {
			flex-direction: column;
		}

		.form-actions button {
			width: 100%;
		}
	}
</style>
