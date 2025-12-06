<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { currentUser } from "$lib/stores/auth0";
    import {
        getSubmissionById,
        updateSubmission,
        deleteSubmission,
        getCompetitionById,
    } from "$lib/api.js";
    import SecondaryButton from "$lib/components/SecondaryButton.svelte";
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import DeleteButton from "$lib/components/DeleteButton.svelte";

    let submission = null;
    let competition = null;
    let title = "";
    let description = "";
    let camera = "";
    let lens = "";
    let settings = "";
    let isSubmitting = false;
    let deleting = false;
    let loading = true;
    let error = null;

    $: submissionId = $page.params.submission;
    $: canDelete =
        submission &&
        $currentUser &&
        competition &&
        (submission.userId === $currentUser._id ||
            submission.userId === $currentUser.sub) &&
        new Date(competition.deadline) > new Date();

    onMount(async () => {
        try {
            // Load submission
            submission = await getSubmissionById(submissionId);

            if (submission) {
                // Load competition to check deadline for delete permission
                if (submission.competitionId) {
                    try {
                        competition = await getCompetitionById(
                            submission.competitionId,
                        );
                    } catch (err) {
                        console.error("Error loading competition:", err);
                    }
                }
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

    async function handleDelete() {
        if (!$currentUser) {
            alert("Bitte logge dich ein!");
            return;
        }

        if (
            !confirm(
                "Möchtest du diese Submission wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
            )
        ) {
            return;
        }

        deleting = true;

        try {
            await deleteSubmission(submissionId, $currentUser._id);
            alert("Submission erfolgreich gelöscht! 🗑️");
            goto(`/competitions/${submission.competitionId}`);
        } catch (err) {
            console.error("Error deleting submission:", err);
            alert("Fehler beim Löschen: " + err.message);
        } finally {
            deleting = false;
        }
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
                <div>
                    <h1>Beitrag bearbeiten</h1>
                    <p>Passe Titel, Beschreibung oder Kamera-Infos an.</p>
                </div>
            </div>

            <form
                class="submission-form"
                on:submit|preventDefault={handleSubmit}
            >
                <!-- Image Preview (Read-Only) -->
                <section class="form-section">
                    <h2>Bild</h2>
                    <div class="form-group">
                        <div class="image-preview">
                            <img
                                src={submission.imageUrl}
                                alt={submission.title}
                            />
                        </div>
                        <span class="help-text">
                            Das Bild kann nicht nachträglich geändert werden.
                        </span>
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

                <!-- Actions -->
                <div class="form-actions">
                    {#if canDelete}
                        <DeleteButton
                            label="Beitrag löschen"
                            loadingLabel="Löschen..."
                            loading={deleting}
                            disabled={isSubmitting}
                            on:click={handleDelete}
                        />
                    {/if}
                    <div class="spacer"></div>
                    <SecondaryButton on:click={goBack} type="button">
                        Abbrechen
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={isSubmitting}>
                        {#if isSubmitting}
                            <span class="loading"></span>
                            <span>Speichern...</span>
                        {:else}
                            Änderungen speichern
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

    .loading-state p {
        color: var(--color-text-secondary);
        margin: 0;
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

    /* Image Preview */
    .image-preview {
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
    }

    .image-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
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

    /* Form Actions */
    .form-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding-top: var(--spacing-lg);
    }

    .spacer {
        flex: 1;
    }

    .delete-button {
        all: unset;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        color: var(--color-danger, #dc2626);
        background: white;
        border: 1px solid var(--color-danger, #dc2626);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .delete-button:hover:not(:disabled) {
        background: var(--color-danger, #dc2626);
        color: white;
    }

    .delete-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Mobile */
    @media (max-width: 768px) {
        .submission-form {
            padding: var(--spacing-lg);
        }

        .form-actions {
            flex-direction: column;
        }

        .form-actions :global(button),
        .form-actions :global(a) {
            width: 100%;
        }
    }
</style>
