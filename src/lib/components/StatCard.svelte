<script>
	export let value;
	export let label;
	export let icon = undefined; // Lucide icon component
</script>

<div class="stat-card">
	{#if icon}
		<div class="stat-icon">
			<svelte:component this={icon} size={24} />
		</div>
	{/if}
	<div class="stat-content">
		<div class="stat-value">{value}</div>
		<div class="stat-label">{label}</div>
	</div>
</div>

<style>
	.stat-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		margin-bottom: var(--spacing-xs);
	}

	.stat-label {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}
</style>
