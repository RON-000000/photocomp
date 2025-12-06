<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { currentUser } from "$lib/stores/auth0";
    import { getSubmissionById, updateSubmission } from "$lib/api.js";
    import SecondaryButton from "$lib/components/SecondaryButton.svelte";
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import BackButton from "$lib/components/BackButton.svelte";
    import { Edit3, Save } from "lucide-svelte";

    let submission = null;
    let title = "";
    let description = "";
    let camera = "";
    let lens = "";
    let settings = "";
    let isSubmitting = false;
    let loading = true;
    let error = null;

    $: submissionId = $page.params.submission;

    onMount(async () => {
        try {
            // Load submission
            submission = await getSubmissionById(submissionId);

            if (submission) {
                // Check ownership
                // Note: Ideally backend also checks, but good for UX.
                // The page might assume user is already checked in parent layout or component,
                // but here we wait for currentUser store if it's not ready yet.
            } else {
                error = "Submission nicht gefunden";
            }
        } catch (err) {
            console.error("Error loading submission:", err);
            error = err.message;
        } finally {
            loading = false;
        }
    });

    // Reactively fill form once submission and user are available
    $: if (submission && $currentUser) {
        if (
            submission.userId !== $currentUser._id &&
            submission.userId !== $currentUser.sub
        ) {
            error =
                "Du hast keine Berechtigung, diese Submission zu bearbeiten.";
        } else if (!title) {
            // Only fill if empty to avoid overwriting user edits if re-running
            title = submission.title;
            description = submission.description;
            camera = submission.metadata?.camera || "";
            lens = submission.metadata?.lens || "";
            settings = submission.metadata?.settings || "";
        }
    }

    async function handleSubmit() {
        if (!$currentUser) {
            alert("Bitte logge dich ein!");
            return;
        }

        isSubmitting = true;

        try {
            const updates = {
                title: title.trim(),
                description: description.trim(),
                metadata: {
                    camera: camera.trim(),
                    lens: lens.trim(),
                    settings: settings.trim(),
                },
            };

            await updateSubmission(submissionId, updates);
            alert("Submission erfolgreich aktualisiert! ✅");
            goto(`/submissions/${submissionId}`);
        } catch (err) {
            console.error("Update error:", err);
            alert("Fehler beim Aktualisieren: " + err.message);
        } finally {
            isSubmitting = false;
        }
    }

    function goBack() {
        goto(`/submissions/${submissionId}`);
    }
</script>

<svelte:head>
    <title>Beitrag bearbeiten - PhotoZürich</title>
</svelte:head>

<div class="edit-page">
    <div class="container">
        {#if loading}
            <div class="loading-state">
                <span class="loading"></span>
                <p>Lade Beitrag...</p>
            </div>
        {:else if error}
            <div class="error-state">
                <h2>Fehler</h2>
                <p>{error}</p>
                <PrimaryButton on:click={() => goto("/competitions")}
                    >Zurück zu Wettbewerben</PrimaryButton
                >
            </div>
        {:else if submission}
            <div class="page-header">
                <div class="back-nav">
                    <BackButton on:click={goBack} />
                </div>
                <div class="header-content">
                    <Edit3 size={32} class="header-icon" />
                    <div>
                        <h1>Beitrag bearbeiten</h1>
                        <p class="subtitle">
                            Passe Titel, Beschreibung oder Kamera-Infos an.
                        </p>
                    </div>
                </div>
            </div>

            <form
                class="submission-form"
                on:submit|preventDefault={handleSubmit}
            >
                <!-- Image Preview (Read-Only) -->
                <div class="form-section">
                    <h2>Bild</h2>
                    <div class="image-preview">
                        <img src={submission.imageUrl} alt={submission.title} />
                        <p class="help-text">
                            Das Bild kann nicht nachträglich geändert werden.
                        </p>
                    </div>
                </div>

                <!-- Basic Information -->
                <div class="form-section">
                    <h2>Informationen</h2>

                    <div class="form-group full-width">
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

                    <div class="form-group full-width">
                        <label for="description">Beschreibung *</label>
                        <textarea
                            id="description"
                            bind:value={description}
                            placeholder="Erzähle die Geschichte hinter deinem Foto..."
                            rows="5"
                            required
                        ></textarea>
                    </div>
                </div>

                <!-- Technical Details -->
                <div class="form-section">
                    <h2>Technische Details (Optional)</h2>
                    <div class="form-grid">
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

                        <div class="form-group full-width">
                            <label for="settings">Einstellungen</label>
                            <input
                                type="text"
                                id="settings"
                                bind:value={settings}
                                placeholder="z.B. f/2.8, 1/125s, ISO 800"
                            />
                        </div>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="form-actions">
                    <SecondaryButton on:click={goBack} type="button">
                        Abbrechen
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={isSubmitting}>
                        {#if isSubmitting}
                            <span class="loading-spinner"></span>
                            <span>Speichern...</span>
                        {:else}
                            <Save size={20} />
                            <span>Änderungen speichern</span>
                        {/if}
                    </PrimaryButton>
                </div>
            </form>
        {/if}
    </div>
</div>

<style>
    .edit-page {
        min-height: calc(100vh - 60px);
        background: var(--color-surface);
        padding: var(--spacing-2xl) 0;
    }

    .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 var(--spacing-xl);
    }

    .page-header {
        margin-bottom: var(--spacing-2xl);
    }

    .back-nav {
        margin-bottom: var(--spacing-md);
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
    }

    .header-content :global(.header-icon) {
        color: var(--color-text-primary);
    }

    .page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        color: var(--color-text-primary);
    }

    .subtitle {
        color: var(--color-text-muted);
        margin: var(--spacing-xs) 0 0 0;
    }

    .loading-state,
    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-4xl);
        gap: var(--spacing-lg);
        text-align: center;
    }

    .loading {
        width: 48px;
        height: 48px;
        border: 4px solid var(--color-border);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Form */
    .submission-form {
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

    .image-preview img {
        width: 100%;
        max-height: 400px;
        object-fit: contain;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background: #f0f0f0;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-lg);
    }

    /* Form Groups */
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

    .form-group input[type="text"],
    .form-group textarea {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-family: inherit;
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--color-primary);
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

    /* Form Actions */
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-md);
        padding-top: var(--spacing-lg);
    }

    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .submission-form {
            padding: 0;
        }

        .form-actions {
            flex-direction: column;
        }
    }
</style>
