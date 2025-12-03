<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Upload, Trophy, Calendar, Users, Image as ImageIcon } from 'lucide-svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	
	let loading = false;
	let juryMembers = [];
	let imageUrl = '';
	
	// Form data
	let formData = {
		title: '',
		description: '',
		theme: '',
		deadline: '',
		startDate: new Date().toISOString().split('T')[0],
		imageUrl: '',
		prizes: ['', '', ''],
		rules: [''],
		juryMembers: [],
		status: 'active'
	};
	
	onMount(async () => {
		await loadJuryMembers();
	});
	
	async function loadJuryMembers() {
		try {
			const response = await fetch('/api/admin/jury');
			juryMembers = await response.json();
		} catch (error) {
			console.error('Error loading jury members:', error);
		}
	}
	
	function handleImageUpload(url) {
		imageUrl = url;
		formData.imageUrl = url;
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
			formData.juryMembers = formData.juryMembers.filter(m => m !== username);
		} else {
			formData.juryMembers = [...formData.juryMembers, username];
		}
	}
	
	async function handleSubmit() {
		// Validation
		if (!formData.title || !formData.description || !formData.deadline) {
			alert('Bitte fülle alle Pflichtfelder aus');
			return;
		}
		
		if (!formData.imageUrl) {
			alert('Bitte lade ein Hero-Bild hoch');
			return;
		}
		
		// Filter empty prizes and rules
		const cleanedData = {
			...formData,
			prizes: formData.prizes.filter(p => p.trim() !== ''),
			rules: formData.rules.filter(r => r.trim() !== '')
		};
		
		loading = true;
		
		try {
			const response = await fetch('/api/competitions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(cleanedData)
			});
			
			if (response.ok) {
				const competition = await response.json();
				alert('Wettbewerb erfolgreich erstellt!');
				goto(`/competitions/${competition._id}`);
			} else {
				const error = await response.json();
				alert('Fehler: ' + error.error);
			}
		} catch (error) {
			console.error('Error creating competition:', error);
			alert('Fehler beim Erstellen des Wettbewerbs');
		} finally {
			loading = false;
		}
	}
</script>

<div class="create-page">
	<div class="container">
		<header class="page-header">
			<h1>
				<Trophy size={32} />
				Neuen Wettbewerb erstellen
			</h1>
			<p>Erstelle einen neuen Foto-Wettbewerb für die Community</p>
		</header>
		
		<form class="competition-form" on:submit|preventDefault={handleSubmit}>
			<!-- Basic Info -->
			<section class="form-section">
				<h2>Grundinformationen</h2>
				
				<div class="form-group">
					<label for="title">Titel *</label>
					<input
						id="title"
						type="text"
						bind:value={formData.title}
						placeholder="z.B. Zürcher Stadtansichten"
						required
					/>
				</div>
				
				<div class="form-group">
					<label for="theme">Thema *</label>
					<input
						id="theme"
						type="text"
						bind:value={formData.theme}
						placeholder="z.B. Urban Photography"
						required
					/>
				</div>
				
				<div class="form-group">
					<label for="description">Beschreibung *</label>
					<textarea
						id="description"
						bind:value={formData.description}
						placeholder="Beschreibe den Wettbewerb..."
						rows="4"
						required
					></textarea>
				</div>
				
				<div class="form-row">
					<div class="form-group">
						<label for="startDate">
							<Calendar size={18} />
							Start-Datum
						</label>
						<input
							id="startDate"
							type="date"
							bind:value={formData.startDate}
						/>
					</div>
					
					<div class="form-group">
						<label for="deadline">
							<Calendar size={18} />
							Deadline *
						</label>
						<input
							id="deadline"
							type="date"
							bind:value={formData.deadline}
							required
						/>
					</div>
				</div>
			</section>
			
			<!-- Hero Image -->
			<section class="form-section">
				<h2>
					<ImageIcon size={24} />
					Hero-Bild
				</h2>
				<p class="section-description">Lade ein Bild hoch, das den Wettbewerb repräsentiert</p>
				
				<ImageUpload
					onUploadComplete={handleImageUpload}
					currentImage={imageUrl}
				/>
			</section>
			
			<!-- Prizes -->
			<section class="form-section">
				<h2>
					<Trophy size={24} />
					Preise
				</h2>
				<p class="section-description">Füge die Preise für die Gewinner hinzu</p>
				
				{#each formData.prizes as prize, index}
					<div class="dynamic-input">
						<input
							type="text"
							bind:value={formData.prizes[index]}
							placeholder="{index + 1}. Platz Preis"
						/>
						{#if formData.prizes.length > 1}
							<button
								type="button"
								class="btn-remove"
								on:click={() => removePrize(index)}
							>
								Entfernen
							</button>
						{/if}
					</div>
				{/each}
				
				<button type="button" class="btn btn-secondary" on:click={addPrize}>
					+ Preis hinzufügen
				</button>
			</section>
			
			<!-- Rules -->
			<section class="form-section">
				<h2>Regeln</h2>
				<p class="section-description">Definiere die Regeln für den Wettbewerb</p>
				
				{#each formData.rules as rule, index}
					<div class="dynamic-input">
						<input
							type="text"
							bind:value={formData.rules[index]}
							placeholder="Regel {index + 1}"
						/>
						{#if formData.rules.length > 1}
							<button
								type="button"
								class="btn-remove"
								on:click={() => removeRule(index)}
							>
								Entfernen
							</button>
						{/if}
					</div>
				{/each}
				
				<button type="button" class="btn btn-secondary" on:click={addRule}>
					+ Regel hinzufügen
				</button>
			</section>
			
			<!-- Jury Selection -->
			<section class="form-section">
				<h2>
					<Users size={24} />
					Jury-Mitglieder
				</h2>
				<p class="section-description">Wähle Jury-Mitglieder für diesen Wettbewerb aus</p>
				
				{#if juryMembers.length === 0}
					<p class="empty-state">Keine Jury-Mitglieder verfügbar. Weise zuerst Benutzern die Jury-Rolle zu.</p>
				{:else}
					<div class="jury-grid">
						{#each juryMembers as member}
							<label class="jury-card">
								<input
									type="checkbox"
									checked={formData.juryMembers.includes(member.username)}
									on:change={() => toggleJuryMember(member.username)}
								/>
								<div class="jury-info">
									<img src={member.avatar} alt={member.name} />
									<div>
										<div class="jury-name">{member.name}</div>
										<div class="jury-username">@{member.username}</div>
									</div>
								</div>
							</label>
						{/each}
					</div>
				{/if}
			</section>
			
			<!-- Submit -->
			<div class="form-actions">
				<button
					type="button"
					class="btn btn-secondary"
					on:click={() => goto('/admin')}
				>
					Abbrechen
				</button>
				<button
					type="submit"
					class="btn btn-primary"
					disabled={loading}
				>
					{#if loading}
						<span class="loading loading-sm"></span>
						Erstelle...
					{:else}
						<Trophy size={20} />
						Wettbewerb erstellen
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
		margin-bottom: var(--spacing-2xl);
	}
	
	.page-header h1 {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
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
		max-width: 800px;
	}
	
	.form-section {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		margin-bottom: var(--spacing-lg);
	}
	
	.form-section h2 {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 var(--spacing-sm) 0;
	}
	
	.section-description {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		margin: 0 0 var(--spacing-lg) 0;
	}
	
	.form-group {
		margin-bottom: var(--spacing-lg);
	}
	
	.form-group:last-child {
		margin-bottom: 0;
	}
	
	.form-group label {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-weight: 500;
		margin-bottom: var(--spacing-sm);
		color: var(--color-text-primary);
	}
	
	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 1rem;
		font-family: var(--font-sans);
	}
	
	.form-group textarea {
		resize: vertical;
	}
	
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}
	
	/* Dynamic Inputs */
	.dynamic-input {
		display: flex;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}
	
	.dynamic-input input {
		flex: 1;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 1rem;
	}
	
	.btn-remove {
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-danger);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}
	
	.btn-remove:hover {
		opacity: 0.9;
	}
	
	/* Jury Grid */
	.jury-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--spacing-md);
	}
	
	.jury-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.jury-card:has(input:checked) {
		border-color: var(--color-primary);
		background: var(--color-surface);
	}
	
	.jury-card input {
		width: auto;
		margin: 0;
		cursor: pointer;
	}
	
	.jury-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex: 1;
	}
	
	.jury-info img {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		object-fit: cover;
	}
	
	.jury-name {
		font-weight: 500;
		font-size: 0.875rem;
	}
	
	.jury-username {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
	
	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl);
		color: var(--color-text-secondary);
	}
	
	/* Form Actions */
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-md);
		margin-top: var(--spacing-xl);
	}
	
	.loading-sm {
		width: 16px;
		height: 16px;
		border-width: 2px;
	}
	
	/* Mobile */
	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}
		
		.jury-grid {
			grid-template-columns: 1fr;
		}
		
		.form-actions {
			flex-direction: column-reverse;
		}
		
		.form-actions button {
			width: 100%;
		}
	}
</style>