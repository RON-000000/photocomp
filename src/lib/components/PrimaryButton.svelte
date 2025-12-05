<script>
	export let disabled = false;
	export let fullWidth = false;
	export let type = 'button';
	export let href = undefined;
</script>

{#if href}
	<a
		{href}
		class="primary-btn"
		class:full-width={fullWidth}
		class:disabled={disabled}
	>
		<slot />
	</a>
{:else}
	<button
		{type}
		{disabled}
		class="primary-btn"
		class:full-width={fullWidth}
		on:click
	>
		<slot />
	</button>
{/if}

<style>
	.primary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-xl);
		font-size: 0.9375rem;
		font-weight: 500;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		font-family: var(--font-sans);
		letter-spacing: -0.01em;
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.primary-btn.full-width {
		width: 100%;
	}

	.primary-btn:hover:not(:disabled):not(.disabled) {
		background: var(--color-primary-hover);
		color: var(--color-accent);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.primary-btn:disabled,
	.primary-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
