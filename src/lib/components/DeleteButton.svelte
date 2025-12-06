<script>
    import { Trash2 } from "lucide-svelte";

    export let label = "Löschen";
    export let loadingLabel = "Löschen...";
    export let disabled = false;
    export let loading = false;
</script>

<button
    type="button"
    class="delete-button"
    on:click
    disabled={disabled || loading}
>
    <Trash2 size={18} />
    <span>{loading ? loadingLabel : label}</span>
</button>

<style>
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
</style>
