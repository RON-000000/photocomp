<script>
	export let text = 'Lädt...';
</script>

<div class="loading-state">
	<span class="loading"></span>
	<p>{text}</p>
</div>

<style>
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-4xl);
		gap: var(--spacing-lg);
	}

	.loading {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}
</style>
