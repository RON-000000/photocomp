<script>
	import { uploadImage } from "$lib/api.js";
	import SecondaryButton from "$lib/components/SecondaryButton.svelte";
	import { Plus } from "lucide-svelte";
	import imageCompression from "browser-image-compression";

	export let onUploadComplete = (imageUrl) => {};
	export let currentImageUrl = "";

	let isUploading = false;
	let isCompressing = false;
	let uploadError = null;
	let previewUrl = currentImageUrl;
	let fileInput;

	async function handleFileSelect(event) {
		const file = event.target.files[0];
		if (!file) return;

		// Validate file size (max 100MB allowed for selection)
		const maxSize = 100 * 1024 * 1024; // 100MB
		if (file.size > maxSize) {
			uploadError = "Datei zu gross! Maximum 100MB.";
			return;
		}

		// Validate file type
		const allowedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/webp",
		];
		if (!allowedTypes.includes(file.type)) {
			uploadError =
				"Ungültiger Dateityp! Nur JPEG, PNG und WebP erlaubt.";
			return;
		}

		// Show preview
		previewUrl = URL.createObjectURL(file);
		uploadError = null;

		try {
			// Compress
			isCompressing = true;
			console.log(
				`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
			);

			const options = {
				maxSizeMB: 2, // Compress to max 2MB
				maxWidthOrHeight: 2400, // Resize to max 2400px
				useWebWorker: true,
				fileType: "image/jpeg",
			};

			const compressedFile = await imageCompression(file, options);
			console.log(
				`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
			);

			isCompressing = false;
			isUploading = true;

			// Upload compressed file
			const result = await uploadImage(compressedFile);
			currentImageUrl = result.imageUrl;
			onUploadComplete(result.imageUrl);
		} catch (error) {
			console.error("Upload/Compression error:", error);
			uploadError = error.message || "Fehler beim Upload/Komprimierung";
			previewUrl = "";
		} finally {
			isCompressing = false;
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

	<SecondaryButton on:click={triggerFileInput} disabled={isUploading}>
		{#if isUploading || isCompressing}
			<span class="loading"></span>
			{#if isCompressing}
				Bild wird optimiert...
			{:else}
				Wird hochgeladen...
			{/if}
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

	{#if isUploading || isCompressing}
		<p class="info">
			{#if isCompressing}
				Bild wird für das Web optimiert (max. 2MB)...
			{:else}
				Upload läuft...
			{/if}
		</p>
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
