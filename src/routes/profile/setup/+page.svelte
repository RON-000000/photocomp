<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { currentUser, refreshUserData } from "$lib/stores/auth0";
	import {
		User,
		MapPin,
		Link as LinkIcon,
		FileText,
		Camera,
		Check,
		ArrowLeft,
		ArrowRight,
	} from "lucide-svelte";
	import ImageUpload from "$lib/components/ImageUpload.svelte";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import SecondaryButton from "$lib/components/SecondaryButton.svelte";
	import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";

	let loading = false;
	let step = 1;
	let usernameAvailable = null;
	let checkingUsername = false;
	let usernameError = "";

	let formData = {
		username: "",
		name: "",
		bio: "",
		location: "Zürich, Schweiz",
		website: "",
		avatar: "",
	};

	onMount(() => {
		if (!$currentUser) {
			goto("/");
			return;
		}

		// For new users (profileCompleted = false), leave username and name empty
		// For returning users, pre-fill with existing data
		const isNewUser = !$currentUser.profileCompleted;
		formData = {
			username: isNewUser ? "" : $currentUser.username || "",
			name: isNewUser ? "" : $currentUser.name || "",
			bio: $currentUser.bio || "",
			location: $currentUser.location || "Zürich, Schweiz",
			website: $currentUser.website || "",
			avatar: $currentUser.avatar || "",
		};
	});

	// Remove @ symbols from username input
	function handleUsernameInput(event) {
		const value = event.target.value.replace(/@/g, "");
		formData.username = value;
	}

	// Debounced username check
	let usernameTimeout;
	async function checkUsername(username) {
		if (usernameTimeout) clearTimeout(usernameTimeout);

		if (!username || username.length < 3) {
			usernameAvailable = null;
			usernameError = username
				? "Username muss mindestens 3 Zeichen haben"
				: "";
			return;
		}

		// Validate format
		if (!/^[a-z0-9_]+$/.test(username)) {
			usernameAvailable = false;
			usernameError =
				"Nur Kleinbuchstaben, Zahlen und Unterstriche erlaubt";
			return;
		}

		checkingUsername = true;
		usernameError = "";

		usernameTimeout = setTimeout(async () => {
			try {
				const response = await fetch(
					`/api/users/check-username?username=${encodeURIComponent(username)}`,
				);
				const data = await response.json();

				// If it's the current user's username, it's available
				if (username === $currentUser.username) {
					usernameAvailable = true;
				} else {
					usernameAvailable = data.available;
					if (!data.available) {
						usernameError = "Dieser Username ist bereits vergeben";
					}
				}
			} catch (error) {
				console.error("Error checking username:", error);
				usernameAvailable = null;
			} finally {
				checkingUsername = false;
			}
		}, 500);
	}

	$: checkUsername(formData.username);

	function handleAvatarUpload(url) {
		formData.avatar = url;
	}

	function nextStep() {
		if (step === 1) {
			if (!formData.username || formData.username.length < 3) {
				usernameError = "Username muss mindestens 3 Zeichen haben";
				return;
			}
			if (!usernameAvailable) {
				return;
			}
			if (!formData.name) {
				alert("Bitte gib deinen Namen ein");
				return;
			}
		}
		step = Math.min(step + 1, 2);
	}

	function prevStep() {
		step = Math.max(step - 1, 1);
	}

	async function handleSubmit() {
		if (!formData.username || !formData.name) {
			alert("Username und Name sind Pflichtfelder");
			return;
		}

		if (!usernameAvailable && formData.username !== $currentUser.username) {
			alert("Bitte wähle einen verfügbaren Username");
			return;
		}

		loading = true;

		try {
			const response = await fetch(
				`/api/users/${$currentUser.username}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...formData,
						profileCompleted: true,
					}),
				},
			);

			if (response.ok) {
				const updatedUser = await response.json();
				currentUser.set(updatedUser);

				// Update cookie
				document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;

				goto(`/profile/${updatedUser.username}`);
			} else {
				const error = await response.json();
				alert("Fehler: " + error.error);
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			alert("Fehler beim Erstellen des Profils");
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Profil einrichten - PhotoComp</title>
</svelte:head>

<div class="setup-page">
	<div class="setup-container">
		<div class="setup-header">
			<h1>Willkommen bei PhotoComp!</h1>
			<p>Richte dein Profil ein, um loszulegen</p>
		</div>

		<!-- Progress Steps -->
		<div class="progress-steps">
			<div
				class="step"
				class:active={step >= 1}
				class:completed={step > 1}
			>
				<div class="step-number">
					{#if step > 1}
						<Check size={16} />
					{:else}
						1
					{/if}
				</div>
				<span class="step-label">Grunddaten</span>
			</div>
			<div class="step-line" class:active={step > 1}></div>
			<div class="step" class:active={step >= 2}>
				<div class="step-number">2</div>
				<span class="step-label">Details</span>
			</div>
		</div>

		<form class="setup-form" on:submit|preventDefault={handleSubmit}>
			{#if step === 1}
				<!-- Step 1: Basic Info -->
				<div class="form-step">
					<h2>Wähle deinen Username und Namen</h2>
					<p class="step-description">
						Dein Username ist einzigartig und wird in deiner
						Profil-URL verwendet.
					</p>

					<div class="form-group">
						<label for="username"> Username * </label>
						<div class="input-with-prefix">
							<span class="input-prefix">@</span>
							<input
								id="username"
								type="text"
								value={formData.username}
								on:input={handleUsernameInput}
								placeholder="dein_username"
								class:error={usernameError}
								class:success={usernameAvailable &&
									!checkingUsername}
							/>
							{#if checkingUsername}
								<span class="input-status checking">
									<span class="loading loading-sm"></span>
								</span>
							{:else if usernameAvailable}
								<span class="input-status available">
									<Check size={16} />
								</span>
							{/if}
						</div>
						{#if usernameError}
							<span class="form-error">{usernameError}</span>
						{:else if usernameAvailable}
							<span class="form-success"
								>Username ist verfügbar</span
							>
						{/if}
						<span class="form-hint"
							>Nur Kleinbuchstaben, Zahlen und Unterstriche. Min.
							3 Zeichen.</span
						>
					</div>

					<div class="form-group">
						<label for="name">
							<User size={18} />
							Anzeigename *
						</label>
						<input
							id="name"
							type="text"
							bind:value={formData.name}
							placeholder="Dein vollständiger Name"
							required
						/>
						<span class="form-hint"
							>Dieser Name wird auf deinem Profil angezeigt.</span
						>
					</div>

					<div class="form-actions">
						<div></div>
						<PrimaryButton
							type="button"
							on:click={nextStep}
							disabled={!usernameAvailable || !formData.name}
						>
							Weiter
							<ArrowRight size={18} />
						</PrimaryButton>
					</div>
				</div>
			{:else if step === 2}
				<!-- Step 2: Additional Details -->
				<div class="form-step">
					<h2>Erzähle uns mehr über dich</h2>
					<p class="step-description">
						Diese Angaben sind optional, helfen aber anderen
						Fotografen, dich kennenzulernen.
					</p>

					<!-- Avatar -->
					<div class="avatar-section">
						{#if formData.avatar}
							<img
								src={formData.avatar}
								alt="Avatar"
								class="current-avatar"
							/>
						{:else}
							<div class="avatar-placeholder"></div>
						{/if}
						<div class="avatar-info">
							<h3>Profilbild</h3>
							<p>Lade ein Foto von dir hoch</p>
							<ImageUpload
								onUploadComplete={handleAvatarUpload}
								currentImage={formData.avatar}
								compact={true}
							/>
						</div>
					</div>

					<div class="form-group">
						<label for="bio">
							<FileText size={18} />
							Bio
						</label>
						<textarea
							id="bio"
							bind:value={formData.bio}
							placeholder="Erzähle etwas über dich und deine Fotografie..."
							rows="3"
						></textarea>
						<span class="form-hint"
							>{formData.bio.length} / 500 Zeichen</span
						>
					</div>

					<div class="form-row">
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
								placeholder="https://..."
							/>
						</div>
					</div>

					<div class="form-actions">
						<SecondaryButton type="button" on:click={prevStep}>
							<ArrowLeft size={18} />
							Zurück
						</SecondaryButton>
						<PrimaryButton type="submit" disabled={loading}>
							{#if loading}
								<span class="loading"></span>
								Speichern...
							{:else}
								<Check size={18} />
								Profil erstellen
							{/if}
						</PrimaryButton>
					</div>
				</div>
			{/if}
		</form>

		<p class="skip-hint">
			Du kannst diese Angaben später jederzeit in deinen <a
				href="/profile/edit">Profileinstellungen</a
			> ändern.
		</p>
	</div>
</div>

<style>
	.setup-page {
		min-height: 100vh;
		background: var(--color-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-2xl);
	}

	.setup-container {
		width: 100%;
		max-width: 560px;
	}

	.setup-header {
		text-align: center;
		margin-bottom: var(--spacing-2xl);
	}

	.setup-header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 var(--spacing-sm) 0;
		letter-spacing: -0.02em;
	}

	.setup-header p {
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Progress Steps */
	.progress-steps {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--spacing-2xl);
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.step-number {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		font-weight: 600;
		background: var(--color-border);
		color: var(--color-text-muted);
		transition: all 0.2s;
	}

	.step.active .step-number {
		background: var(--color-primary);
		color: white;
	}

	.step.completed .step-number {
		background: var(--color-success);
		color: white;
	}

	.step-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.step.active .step-label {
		color: var(--color-text-primary);
	}

	.step-line {
		width: 80px;
		height: 2px;
		background: var(--color-border);
		margin: 0 var(--spacing-md);
		margin-bottom: var(--spacing-lg);
		transition: background 0.2s;
	}

	.step-line.active {
		background: var(--color-primary);
	}

	/* Form */
	.setup-form {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--spacing-2xl);
	}

	.form-step h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 var(--spacing-xs) 0;
	}

	.step-description {
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		margin: 0 0 var(--spacing-xl) 0;
	}

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
		font-size: 0.9375rem;
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

	.form-group input.error {
		border-color: var(--color-danger);
	}

	.form-group input.success {
		border-color: var(--color-success);
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

	.form-error {
		display: block;
		margin-top: var(--spacing-xs);
		font-size: 0.75rem;
		color: var(--color-danger);
	}

	.form-success {
		display: block;
		margin-top: var(--spacing-xs);
		font-size: 0.75rem;
		color: var(--color-success);
	}

	/* Username Input */
	.input-with-prefix {
		display: flex;
		align-items: center;
		position: relative;
	}

	.input-prefix {
		position: absolute;
		left: var(--spacing-md);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.input-with-prefix input {
		padding-left: calc(var(--spacing-md) + 1rem);
		padding-right: calc(var(--spacing-md) + 2rem);
	}

	.input-status {
		position: absolute;
		right: var(--spacing-md);
		display: flex;
		align-items: center;
	}

	.input-status.available {
		color: var(--color-success);
	}

	.input-status.checking {
		color: var(--color-text-muted);
	}

	/* Avatar Section */
	.avatar-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		margin-bottom: var(--spacing-xl);
	}

	.current-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid white;
		box-shadow: var(--shadow-sm);
	}

	.avatar-placeholder {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 1px solid var(--color-border);
		background: white;
		flex-shrink: 0;
	}

	.avatar-info h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 var(--spacing-xs) 0;
	}

	.avatar-info p {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0 0 var(--spacing-sm) 0;
	}

	/* Form Row */
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
	}

	/* Form Actions */
	.form-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-xl);
		border-top: 1px solid var(--color-border);
	}

	.loading {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Skip Hint */
	.skip-hint {
		text-align: center;
		margin-top: var(--spacing-xl);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.skip-hint a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.skip-hint a:hover {
		text-decoration: underline;
	}

	/* Tablet */
	@media (max-width: 768px) {
		.setup-page {
			padding: var(--spacing-lg);
			align-items: flex-start;
			padding-top: var(--spacing-2xl);
		}

		.setup-header h1 {
			font-size: 1.75rem;
		}

		.step-line {
			width: 60px;
		}
	}

	/* Mobile */
	@media (max-width: 640px) {
		.setup-page {
			padding: var(--spacing-md);
			padding-top: var(--spacing-xl);
			min-height: 100dvh; /* Use dynamic viewport height for mobile */
		}

		.setup-container {
			width: 100%;
		}

		.setup-header {
			margin-bottom: var(--spacing-lg);
		}

		.setup-header h1 {
			font-size: 1.5rem;
		}

		.setup-header p {
			font-size: 0.9375rem;
		}

		/* Progress Steps Mobile */
		.progress-steps {
			margin-bottom: var(--spacing-lg);
		}

		.step-number {
			width: 28px;
			height: 28px;
			font-size: 0.8125rem;
		}

		.step-label {
			font-size: 0.6875rem;
		}

		.step-line {
			width: 40px;
			margin: 0 var(--spacing-sm);
			margin-bottom: var(--spacing-md);
		}

		/* Form Mobile */
		.setup-form {
			padding: var(--spacing-lg);
			border-radius: var(--radius-lg);
		}

		.form-step h2 {
			font-size: 1.125rem;
		}

		.step-description {
			font-size: 0.875rem;
			margin-bottom: var(--spacing-lg);
		}

		.form-group {
			margin-bottom: var(--spacing-md);
		}

		.form-group label {
			font-size: 0.875rem;
			margin-bottom: var(--spacing-xs);
		}

		.form-group input,
		.form-group textarea {
			padding: var(--spacing-md);
			font-size: 16px; /* Prevents zoom on iOS */
			-webkit-appearance: none;
			border-radius: var(--radius-md);
		}

		/* Keep special padding for username input with @ prefix */
		.input-with-prefix input {
			padding-left: calc(var(--spacing-md) + 1.25rem);
			padding-right: calc(var(--spacing-md) + 2rem);
		}

		.form-hint {
			font-size: 0.6875rem;
		}

		/* Avatar Section Mobile */
		.avatar-section {
			flex-direction: column;
			text-align: center;
			padding: var(--spacing-md);
			gap: var(--spacing-md);
		}

		.current-avatar {
			width: 72px;
			height: 72px;
		}

		.avatar-placeholder {
			width: 72px;
			height: 72px;
		}

		.avatar-info h3 {
			font-size: 0.9375rem;
		}

		.avatar-info p {
			font-size: 0.8125rem;
			margin-bottom: var(--spacing-xs);
		}

		/* Form Row Mobile */
		.form-row {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		/* Form Actions Mobile */
		.form-actions {
			flex-direction: column-reverse;
			gap: var(--spacing-sm);
			margin-top: var(--spacing-lg);
			padding-top: var(--spacing-lg);
		}

		.form-actions :global(button),
		.form-actions :global(a) {
			width: 100%;
			min-height: 48px; /* Touch-friendly height */
			justify-content: center;
		}

		/* Skip Hint Mobile */
		.skip-hint {
			margin-top: var(--spacing-lg);
			font-size: 0.8125rem;
			padding: 0 var(--spacing-sm);
		}
	}

	/* Small Mobile (iPhone SE, etc.) */
	@media (max-width: 375px) {
		.setup-page {
			padding: var(--spacing-sm);
			padding-top: var(--spacing-lg);
		}

		.setup-header h1 {
			font-size: 1.375rem;
		}

		.setup-form {
			padding: var(--spacing-md);
		}

		.form-step h2 {
			font-size: 1rem;
		}

		.step-description {
			font-size: 0.8125rem;
		}

		.step-line {
			width: 32px;
		}

		.current-avatar,
		.avatar-placeholder {
			width: 64px;
			height: 64px;
		}
	}

	/* Touch-friendly improvements */
	@media (hover: none) and (pointer: coarse) {
		.form-group input,
		.form-group textarea {
			font-size: 16px; /* Prevents zoom on iOS */
		}

		.btn-back:active {
			background: var(--color-surface);
		}

		.form-group input:focus,
		.form-group textarea:focus {
			outline: none;
			border-color: var(--color-primary);
			box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
		}
	}

	/* Safe area for notched phones */
	@supports (padding: max(0px)) {
		.setup-page {
			padding-left: max(var(--spacing-md), env(safe-area-inset-left));
			padding-right: max(var(--spacing-md), env(safe-area-inset-right));
			padding-bottom: max(var(--spacing-md), env(safe-area-inset-bottom));
		}
	}
</style>
