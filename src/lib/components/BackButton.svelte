<script>
	import { ArrowLeft } from 'lucide-svelte';

	export let label = 'Zurück';
</script>

<button class="back-button" on:click>
	<ArrowLeft size={20} />
	<span>{label}</span>
</button>

<style>
	.back-button {
		all: unset;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		color: var(--color-text-secondary);
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.back-button:hover {
		color: var(--color-primary);
		border-color: var(--color-primary);
		background: var(--color-surface);
	}
</style>
