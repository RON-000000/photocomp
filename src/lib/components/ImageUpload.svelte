<script>
	import { uploadImage } from '$lib/api.js';
	import SecondaryButton from '$lib/components/SecondaryButton.svelte';
	import { Plus } from 'lucide-svelte';

	export let onUploadComplete = (imageUrl) => {};
	export let currentImageUrl = '';
	
	let isUploading = false;
	let uploadError = null;
	let previewUrl = currentImageUrl;
	let fileInput;
	
	async function handleFileSelect(event) {
		const file = event.target.files[0];
		if (!file) return;

		// Validate file size (max 100MB before compression)
		const maxSize = 100 * 1024 * 1024; // 100MB
		if (file.size > maxSize) {
			uploadError = 'Datei zu gross! Maximum 100MB.';
			return;
		}
		
		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			uploadError = 'Ungültiger Dateityp! Nur JPEG, PNG und WebP erlaubt.';
			return;
		}
		
		// Show preview
		previewUrl = URL.createObjectURL(file);
		uploadError = null;
		
		// Upload
		isUploading = true;
		
		try {
			const result = await uploadImage(file);
			currentImageUrl = result.imageUrl;
			onUploadComplete(result.imageUrl);
		} catch (error) {
			uploadError = error.message;
			previewUrl = '';
		} finally {
			isUploading = false;
		}
	}
	
	function triggerFileInput() {
		fileInput.click();
	}
</script>

<div class="image-upload">
	<input
		type="file"
		accept="image/jpeg,image/jpg,image/png,image/webp"
		on:change={handleFileSelect}
		bind:this={fileInput}
		style="display: none;"
	/>
	
	{#if previewUrl}
		<div class="preview">
			<img src={previewUrl} alt="Preview" />
			{#if !currentImageUrl}
				<div class="preview-overlay">
					<p>Vorschau - noch nicht hochgeladen</p>
				</div>
			{/if}
		</div>
	{/if}

	<SecondaryButton
		on:click={triggerFileInput}
		disabled={isUploading}
	>
		{#if isUploading}
			<span class="loading"></span>
			Wird hochgeladen...
		{:else if currentImageUrl}
			<Plus size={16} />
			<span>Bild ändern</span>
		{:else}
			<Plus size={16} />
			<span>Bild auswählen</span>
		{/if}
	</SecondaryButton>
	
	{#if uploadError}
		<p class="error">{uploadError}</p>
	{/if}
	
	{#if isUploading}
		<p class="info">Bild wird komprimiert und hochgeladen... (max. 5MB)</p>
	{/if}
	
	{#if currentImageUrl}
		<p class="success">✅ Bild erfolgreich hochgeladen!</p>
	{/if}
</div>

<style>
	.image-upload {
		margin-bottom: var(--spacing-lg);
	}
	
	.preview {
		position: relative;
		margin-bottom: var(--spacing-md);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-md);
	}
	
	.preview img {
		width: 100%;
		max-height: 400px;
		object-fit: cover;
	}
	
	.preview-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.preview-overlay p {
		color: white;
		font-weight: 600;
		margin: 0;
	}
	
	.error {
		color: var(--color-danger);
		font-size: 0.875rem;
		margin-top: var(--spacing-sm);
	}
	
	.info {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		margin-top: var(--spacing-sm);
	}
	
	.success {
		color: var(--color-success);
		font-size: 0.875rem;
		font-weight: 600;
		margin-top: var(--spacing-sm);
	}
</style>