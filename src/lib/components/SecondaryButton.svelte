<script>
	export let disabled = false;
	export let type = 'button';
	export let href = undefined;
</script>

{#if href}
	<a
		{href}
		class="secondary-btn"
		class:disabled={disabled}
	>
		<slot />
	</a>
{:else}
	<button
		{type}
		{disabled}
		class="secondary-btn"
		on:click
	>
		<slot />
	</button>
{/if}

<style>
	.secondary-btn {
		all: unset;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		color: var(--color-text-secondary);
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.secondary-btn:hover:not(:disabled):not(.disabled) {
		color: var(--color-primary);
		border-color: var(--color-primary);
		background: var(--color-surface);
	}

	.secondary-btn:disabled,
	.secondary-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
