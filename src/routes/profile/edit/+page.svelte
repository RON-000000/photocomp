<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, refreshUserData } from '$lib/stores/auth0';
	import { User, MapPin, Link as LinkIcon, FileText, Camera } from 'lucide-svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let loading = false;
	let formData = {
		name: '',
		bio: '',
		location: '',
		website: '',
		avatar: ''
	};
	
	onMount(() => {
		if ($currentUser) {
			formData = {
				name: $currentUser.name || '',
				bio: $currentUser.bio || '',
				location: $currentUser.location || '',
				website: $currentUser.website || '',
				avatar: $currentUser.avatar || ''
			};
		}
	});
	
	function handleAvatarUpload(url) {
		formData.avatar = url;
	}
	
	async function handleSubmit() {
		if (!formData.name) {
			alert('Name ist ein Pflichtfeld');
			return;
		}
		
		loading = true;
		
		try {
			const response = await fetch(`/api/users/${$currentUser.username}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			
			if (response.ok) {
				const updatedUser = await response.json();
				
				// Update current user in store
				currentUser.set(updatedUser);
				
				alert('Profil erfolgreich aktualisiert!');
				goto(`/profile/${$currentUser.username}`);
			} else {
				const error = await response.json();
				alert('Fehler: ' + error.error);
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			alert('Fehler beim Aktualisieren des Profils');
		} finally {
			loading = false;
		}
	}
</script>

<div class="edit-page">
	<div class="container">
		<header class="page-header">
			<h1>
				<User size={32} />
				Profil bearbeiten
			</h1>
			<p>Aktualisiere deine Profilinformationen</p>
		</header>
		
		<form class="edit-form" on:submit|preventDefault={handleSubmit}>
			<!-- Avatar Section -->
			<section class="form-section">
				<h2>
					<Camera size={24} />
					Profilbild
				</h2>
				<p class="section-description">Lade ein neues Profilbild hoch</p>
				
				<div class="avatar-section">
					<img 
						src={formData.avatar || $currentUser?.avatar} 
						alt="Avatar" 
						class="current-avatar"
					/>
					<div class="avatar-upload">
						<ImageUpload
							onUploadComplete={handleAvatarUpload}
							currentImage={formData.avatar}
						/>
					</div>
				</div>
			</section>
			
			<!-- Basic Info -->
			<section class="form-section">
				<h2>Grundinformationen</h2>
				
				<div class="form-group">
					<label for="name">
						<User size={18} />
						Name *
					</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						placeholder="Dein vollständiger Name"
						required
					/>
				</div>
				
				<div class="form-group">
					<label for="bio">
						<FileText size={18} />
						Bio
					</label>
					<textarea
						id="bio"
						bind:value={formData.bio}
						placeholder="Erzähle etwas über dich..."
						rows="4"
					></textarea>
					<span class="form-hint">{formData.bio.length} / 500 Zeichen</span>
				</div>
				
				<div class="form-group">
					<label for="location">
						<MapPin size={18} />
						Standort
					</label>
					<input
						id="location"
						type="text"
						bind:value={formData.location}
						placeholder="z.B. Zürich, Schweiz"
					/>
				</div>
				
				<div class="form-group">
					<label for="website">
						<LinkIcon size={18} />
						Website
					</label>
					<input
						id="website"
						type="url"
						bind:value={formData.website}
						placeholder="https://deine-website.ch"
					/>
				</div>
			</section>
			
			<!-- Account Info (Read-only) -->
			<section class="form-section">
				<h2>Account-Informationen</h2>
				<p class="section-description">Diese Informationen können nicht geändert werden</p>
				
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">Username</span>
						<span class="info-value">@{$currentUser?.username}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Email</span>
						<span class="info-value">{$currentUser?.email}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Mitglied seit</span>
						<span class="info-value">
							{new Date($currentUser?.createdAt).toLocaleDateString('de-CH', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</span>
					</div>
					<div class="info-item">
						<span class="info-label">Rolle</span>
						<span class="role-badge role-{$currentUser?.role || 'user'}">
							{$currentUser?.role || 'user'}
						</span>
					</div>
				</div>
			</section>
			
			<!-- Form Actions -->
			<div class="form-actions">
				<button
					type="button"
					class="btn btn-secondary"
					on:click={() => goto(`/profile/${$currentUser.username}`)}
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
						Speichere...
					{:else}
						<User size={20} />
						Änderungen speichern
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.edit-page {
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
	.edit-form {
		max-width: 700px;
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
	
	/* Avatar Section */
	.avatar-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-xl);
	}
	
	.current-avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid var(--color-border);
	}
	
	.avatar-upload {
		flex: 1;
	}
	
	/* Form Groups */
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
		transition: border-color 0.2s;
	}
	
	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}
	
	.form-group textarea {
		resize: vertical;
	}
	
	.form-hint {
		display: block;
		margin-top: var(--spacing-xs);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	
	/* Info Grid */
	.info-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-lg);
	}
	
	.info-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
	
	.info-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}
	
	.info-value {
		font-size: 1rem;
		color: var(--color-text-primary);
	}
	
	.role-badge {
		display: inline-block;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		width: fit-content;
	}
	
	.role-user {
		background: #e0e7ff;
		color: #3730a3;
	}
	
	.role-jury {
		background: #fef3c7;
		color: #92400e;
	}
	
	.role-admin {
		background: #fee2e2;
		color: #991b1b;
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
		.avatar-section {
			flex-direction: column;
			text-align: center;
		}
		
		.info-grid {
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