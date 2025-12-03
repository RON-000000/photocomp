<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { currentUser, isAuthenticated } from '$lib/stores/auth0';
	import { getCompetitionById, updateCompetition, uploadImage } from '$lib/api.js';
	import { Trophy, Calendar, Image, Users, Plus, X, Upload, Search, Save, ArrowLeft } from 'lucide-svelte';

	let loading = true;
	let saving = false;
	let uploadingImage = false;
	let competition = null;
	let juryMembers = [];
	let allUsers = [];
	let jurySearchQuery = '';
	let heroImageFile = null;
	let heroImagePreview = null;
	let fileInput;
	let uploadSuccess = false;

	$: competitionId = $page.params.id;

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
		},
		status: 'active'
	};

	let errors = {};

	onMount(async () => {
		// Check if user is admin
		if (!$isAuthenticated || $currentUser?.role !== 'admin') {
			goto('/admin');
			return;
		}

		await loadData();
	});

	async function loadData() {
		loading = true;

		try {
			// Load competition
			competition = await getCompetitionById(competitionId);

			// Populate form with competition data
			formData = {
				title: competition.title || '',
				description: competition.description || '',
				theme: competition.theme || '',
				startDate: competition.startDate ? competition.startDate.split('T')[0] : '',
				deadline: competition.deadline ? competition.deadline.split('T')[0] : '',
				imageUrl: competition.imageUrl || '',
				prizes: competition.prizes && competition.prizes.length > 0 ? competition.prizes : [''],
				rules: competition.rules && competition.rules.length > 0 ? competition.rules : [''],
				juryMembers: competition.juryMembers || [],
				votingWeight: competition.votingWeight || { community: 0.5, jury: 0.5 },
				status: competition.status || 'active'
			};

			heroImagePreview = competition.imageUrl;
			uploadSuccess = false;

			// Load all users for jury selection
			const response = await fetch('/api/admin/users');
			if (response.ok) {
				allUsers = await response.json();
				juryMembers = allUsers.filter(u => u.role === 'jury' || u.role === 'admin');
			}
		} catch (error) {
			console.error('Error loading data:', error);
			alert('Fehler beim Laden der Competition: ' + error.message);
		} finally {
			loading = false;
		}
	}

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

	$: filteredJuryMembers = juryMembers.filter(user => {
		if (!jurySearchQuery) return true;
		const query = jurySearchQuery.toLowerCase();
		return (
			user.name?.toLowerCase().includes(query) ||
			user.username?.toLowerCase().includes(query) ||
			user.email?.toLowerCase().includes(query)
		);
	});

	function triggerFileInput() {
		fileInput.click();
	}

	async function handleImageSelect(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			alert('Ungültiger Dateityp! Nur JPEG, PNG und WebP erlaubt.');
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			alert('Bild ist zu groß. Maximum 10MB erlaubt.');
			return;
		}

		heroImageFile = file;
		uploadSuccess = false;

		const reader = new FileReader();
		reader.onload = (e) => {
			heroImagePreview = e.target.result;
		};
		reader.readAsDataURL(file);

		await uploadHeroImage();
	}

	async function uploadHeroImage() {
		if (!heroImageFile) return;
		uploadingImage = true;
		try {
			const result = await uploadImage(heroImageFile, 'competitions');
			formData.imageUrl = result.imageUrl || result.url;
			uploadSuccess = true;
			console.log('Upload successful, URL:', formData.imageUrl);
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('Fehler beim Hochladen des Bildes: ' + error.message);
			heroImageFile = null;
			heroImagePreview = null;
			uploadSuccess = false;
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

		if (formData.startDate && formData.deadline) {
			const start = new Date(formData.startDate);
			const end = new Date(formData.deadline);
			if (start >= end) {
				errors.deadline = 'Deadline muss nach dem Startdatum liegen';
			}
		}

		const totalWeight = formData.votingWeight.community + formData.votingWeight.jury;
		if (Math.abs(totalWeight - 1) > 0.01) {
			errors.votingWeight = 'Community- und Jury-Gewicht müssen zusammen 1.0 ergeben';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(event) {
		event.preventDefault();

		if (!validateForm()) {
			alert('Bitte fülle alle erforderlichen Felder korrekt aus');
			return;
		}

		saving = true;

		try {
			const cleanedData = {
				...formData,
				prizes: formData.prizes.filter(p => p.trim() !== ''),
				rules: formData.rules.filter(r => r.trim() !== '')
			};

			await updateCompetition(competitionId, cleanedData);

			alert('Competition erfolgreich aktualisiert! ✅');
			goto(`/competitions/${competitionId}`);
		} catch (error) {
			console.error('Update error:', error);
			alert('Fehler beim Aktualisieren: ' + error.message);
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		if (confirm('Möchtest du die Bearbeitung wirklich abbrechen? Alle ungespeicherten Änderungen gehen verloren.')) {
			goto(`/competitions/${competitionId}`);
		}
	}
</script>

<svelte:head>
	<title>Competition bearbeiten - PhotoZürich Admin</title>
</svelte:head>

<div class="admin-container">
	<div class="page-header">
		<button on:click={handleCancel} class="back-button">
			<ArrowLeft size={20} />
			<span>Zurück</span>
		</button>
		<div class="header-content">
			<Trophy size={32} class="header-icon" />
			<div>
				<h1>Competition bearbeiten</h1>
				<p class="subtitle">Passe die Details des Wettbewerbs an</p>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Lade Competition-Daten...</p>
		</div>
	{:else}
		<form on:submit={handleSubmit} class="competition-form">
			<!-- Hero Image -->
			<div class="form-section">
				<h2>Hero Bild</h2>
				<div class="image-upload-section">
					<input
						type="file"
						accept="image/jpeg,image/jpg,image/png,image/webp"
						on:change={handleImageSelect}
						bind:this={fileInput}
						style="display: none;"
					/>

					{#if heroImagePreview}
						<div class="image-preview">
							<img src={heroImagePreview} alt="Hero Preview" />
							{#if uploadingImage}
								<div class="upload-overlay">
									<div class="spinner"></div>
									<p>Wird hochgeladen...</p>
								</div>
							{/if}
						</div>
					{/if}

					<button
						type="button"
						class="btn btn-secondary"
						on:click={triggerFileInput}
						disabled={uploadingImage}
					>
						{#if uploadingImage}
							<span class="loading"></span>
							Wird hochgeladen...
						{:else if heroImagePreview}
							📸 Bild ändern
						{:else}
							📸 Bild hochladen
						{/if}
					</button>

					{#if uploadSuccess}
						<p class="success">✅ Bild erfolgreich hochgeladen!</p>
					{/if}
				</div>
			</div>

			<!-- Basic Info -->
			<div class="form-section">
				<h2>Grundlegende Informationen</h2>
				<div class="form-grid">
					<div class="form-group">
						<label for="title">Titel *</label>
						<input
							type="text"
							id="title"
							bind:value={formData.title}
							class:error={errors.title}
							required
						/>
						{#if errors.title}
							<span class="error-message">{errors.title}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="theme">Thema *</label>
						<input
							type="text"
							id="theme"
							bind:value={formData.theme}
							class:error={errors.theme}
							required
						/>
						{#if errors.theme}
							<span class="error-message">{errors.theme}</span>
						{/if}
					</div>

					<div class="form-group full-width">
						<label for="description">Beschreibung *</label>
						<textarea
							id="description"
							bind:value={formData.description}
							rows="4"
							class:error={errors.description}
							required
						></textarea>
						{#if errors.description}
							<span class="error-message">{errors.description}</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Dates -->
			<div class="form-section">
				<h2>Zeitraum</h2>
				<div class="form-grid">
					<div class="form-group">
						<label for="startDate">Startdatum *</label>
						<input
							type="date"
							id="startDate"
							bind:value={formData.startDate}
							class:error={errors.startDate}
							required
						/>
						{#if errors.startDate}
							<span class="error-message">{errors.startDate}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="deadline">Deadline *</label>
						<input
							type="date"
							id="deadline"
							bind:value={formData.deadline}
							class:error={errors.deadline}
							required
						/>
						{#if errors.deadline}
							<span class="error-message">{errors.deadline}</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Status -->
			<div class="form-section">
				<h2>Status</h2>
				<div class="form-group">
					<label for="status">Competition Status</label>
					<select id="status" bind:value={formData.status}>
						<option value="active">Aktiv</option>
						<option value="voting">Voting</option>
						<option value="completed">Beendet</option>
					</select>
				</div>
			</div>

			<!-- Prizes -->
			<div class="form-section">
				<h2>Preise</h2>
				<div class="dynamic-list">
					{#each formData.prizes as prize, index}
						<div class="list-item">
							<input
								type="text"
								bind:value={formData.prizes[index]}
								placeholder={`Preis ${index + 1}`}
							/>
							<button type="button" on:click={() => removePrize(index)} class="remove-button">
								<X size={16} />
							</button>
						</div>
					{/each}
					<button type="button" on:click={addPrize} class="add-button">
						<Plus size={16} />
						<span>Preis hinzufügen</span>
					</button>
				</div>
			</div>

			<!-- Rules -->
			<div class="form-section">
				<h2>Regeln</h2>
				<div class="dynamic-list">
					{#each formData.rules as rule, index}
						<div class="list-item">
							<textarea
								bind:value={formData.rules[index]}
								placeholder={`Regel ${index + 1}`}
								rows="2"
							></textarea>
							<button type="button" on:click={() => removeRule(index)} class="remove-button">
								<X size={16} />
							</button>
						</div>
					{/each}
					<button type="button" on:click={addRule} class="add-button">
						<Plus size={16} />
						<span>Regel hinzufügen</span>
					</button>
				</div>
			</div>

			<!-- Jury Members -->
			<div class="form-section">
				<h2>Jury-Mitglieder</h2>
				<div class="jury-search">
					<Search size={16} />
					<input
						type="text"
						bind:value={jurySearchQuery}
						placeholder="Nach Name, Username oder Email suchen..."
					/>
					{#if jurySearchQuery}
						<button type="button" on:click={() => jurySearchQuery = ''} class="clear-search">
							<X size={16} />
						</button>
					{/if}
				</div>
				<div class="selected-count">
					{formData.juryMembers.length} ausgewählt
				</div>

				{#if filteredJuryMembers.length === 0}
					<div class="no-results">
						<p>Keine Jury-Mitglieder gefunden</p>
					</div>
				{:else}
					<div class="jury-table-wrapper">
						<table class="jury-table">
							<thead>
								<tr>
									<th style="width: 50px;">
										<input
											type="checkbox"
											checked={filteredJuryMembers.every(m => formData.juryMembers.includes(m.username))}
											on:change={(e) => {
												if (e.target.checked) {
													filteredJuryMembers.forEach(m => {
														if (!formData.juryMembers.includes(m.username)) {
															toggleJuryMember(m.username);
														}
													});
												} else {
													filteredJuryMembers.forEach(m => {
														if (formData.juryMembers.includes(m.username)) {
															toggleJuryMember(m.username);
														}
													});
												}
											}}
										/>
									</th>
									<th>Benutzer</th>
									<th>Email</th>
									<th>Rolle</th>
								</tr>
							</thead>
							<tbody>
								{#each filteredJuryMembers as member}
								<tr>
									<td>
										<input
											type="checkbox"
											checked={formData.juryMembers.includes(member.username)}
											on:change={() => toggleJuryMember(member.username)}
										/>
									</td>
									<td>
										<div class="user-cell">
											<img src={member.avatar} alt={member.name} class="user-avatar" />
											<div>
												<div class="user-name">{member.name || member.username}</div>
												<div class="user-username">@{member.username}</div>
											</div>
										</div>
									</td>
									<td class="email-cell">{member.email}</td>
									<td>
										<span class="role-badge role-{member.role || 'jury'}">
											{member.role || 'jury'}
										</span>
									</td>
								</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

			<!-- Voting Weights -->
			<div class="form-section">
				<h2>Voting-Gewichtung</h2>
				<div class="voting-weights">
					<div class="weight-input">
						<label for="communityWeight">Community Gewicht</label>
						<input
							type="number"
							id="communityWeight"
							bind:value={formData.votingWeight.community}
							min="0"
							max="1"
							step="0.1"
							class:error={errors.votingWeight}
						/>
						<span class="weight-percentage">{(formData.votingWeight.community * 100).toFixed(0)}%</span>
					</div>
					<div class="weight-input">
						<label for="juryWeight">Jury Gewicht</label>
						<input
							type="number"
							id="juryWeight"
							bind:value={formData.votingWeight.jury}
							min="0"
							max="1"
							step="0.1"
							class:error={errors.votingWeight}
						/>
						<span class="weight-percentage">{(formData.votingWeight.jury * 100).toFixed(0)}%</span>
					</div>
				</div>
				{#if errors.votingWeight}
					<span class="error-message">{errors.votingWeight}</span>
				{/if}
			</div>

			<!-- Form Actions -->
			<div class="form-actions">
				<button type="button" on:click={handleCancel} class="cancel-button">
					Abbrechen
				</button>
				<button type="submit" disabled={saving} class="submit-button">
					<Save size={20} />
					<span>{saving ? 'Wird gespeichert...' : 'Änderungen speichern'}</span>
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.admin-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-2xl) var(--spacing-xl);
	}

	.page-header {
		margin-bottom: var(--spacing-2xl);
	}

	.back-button {
		all: unset;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		margin-bottom: var(--spacing-md);
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
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.header-content h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.subtitle {
		margin: var(--spacing-xs) 0 0 0;
		color: var(--color-text-muted);
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3xl);
		gap: var(--spacing-md);
	}

	.spinner {
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

	.competition-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
	}

	.form-section {
		background: white;
		padding: var(--spacing-xl);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.form-section h2 {
		margin: 0 0 var(--spacing-lg) 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-lg);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-weight: 600;
		color: var(--color-text-primary);
		font-size: 0.875rem;
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: inherit;
		font-size: 1rem;
		transition: border-color 0.2s ease;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.form-group input.error,
	.form-group textarea.error {
		border-color: var(--color-error);
	}

	.error-message {
		color: var(--color-error);
		font-size: 0.875rem;
	}

	.image-upload-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.image-preview {
		position: relative;
		width: 100%;
		max-height: 300px;
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.image-preview img {
		width: 100%;
		height: auto;
		display: block;
	}

	.upload-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		color: white;
	}

	.success {
		color: var(--color-success);
		font-size: 0.875rem;
		font-weight: 600;
		margin-top: var(--spacing-sm);
	}

	.dynamic-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.list-item {
		display: flex;
		gap: var(--spacing-sm);
	}

	.list-item input,
	.list-item textarea {
		flex: 1;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: inherit;
	}

	.remove-button {
		all: unset;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: var(--color-error);
		color: white;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.remove-button:hover {
		background: #c53030;
	}

	.add-button {
		all: unset;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		background: white;
		color: var(--color-primary);
		border: 1px dashed var(--color-primary);
		border-radius: var(--radius-md);
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s ease;
		align-self: flex-start;
	}

	.add-button:hover {
		background: var(--color-surface);
	}

	.jury-search {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
	}

	.jury-search input {
		flex: 1;
		border: none;
		outline: none;
		font-family: inherit;
	}

	.clear-search {
		all: unset;
		display: flex;
		cursor: pointer;
		color: var(--color-text-muted);
	}

	.selected-count {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-sm);
	}

	.jury-table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		max-height: 500px;
		overflow-y: auto;
	}

	.jury-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.jury-table thead {
		background: var(--color-surface);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.jury-table th {
		text-align: left;
		padding: var(--spacing-md);
		font-weight: 600;
		color: var(--color-text-primary);
		border-bottom: 2px solid var(--color-border);
	}

	.jury-table td {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}

	.jury-table tbody tr {
		transition: background-color 0.2s ease;
	}

	.jury-table tbody tr:hover {
		background: var(--color-surface);
	}

	.jury-table tbody tr:last-child td {
		border-bottom: none;
	}

	.user-cell {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		object-fit: cover;
	}

	.user-name {
		font-weight: 600;
		color: var(--color-text-primary);
		font-size: 0.875rem;
	}

	.user-username {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.email-cell {
		color: var(--color-text-secondary);
	}

	.role-badge {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.role-badge.role-admin {
		background: #FED7D7;
		color: #9B2C2C;
	}

	.role-badge.role-jury {
		background: #BEE3F8;
		color: #2C5282;
	}

	.role-badge.role-user {
		background: #E2E8F0;
		color: #4A5568;
	}

	.no-results {
		text-align: center;
		padding: var(--spacing-lg);
		color: var(--color-text-muted);
	}

	.voting-weights {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-lg);
	}

	.weight-input {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.weight-input label {
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-text-primary);
	}

	.weight-input input {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.weight-percentage {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: flex-end;
		padding-top: var(--spacing-xl);
		border-top: 1px solid var(--color-border);
	}

	.cancel-button {
		all: unset;
		padding: var(--spacing-sm) var(--spacing-xl);
		background: white;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cancel-button:hover {
		background: var(--color-surface);
	}

	.submit-button {
		all: unset;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-xl);
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-md);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.submit-button:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.voting-weights {
			grid-template-columns: 1fr;
		}

		.form-actions {
			flex-direction: column;
		}

		.cancel-button,
		.submit-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
