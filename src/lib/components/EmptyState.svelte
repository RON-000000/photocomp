<script>
	import SecondaryButton from './SecondaryButton.svelte';

	export let message = 'Keine Einträge gefunden.';
	export let buttonText = undefined;
	export let buttonAction = undefined;
</script>

<div class="empty-state">
	<p>{message}</p>
	{#if buttonText && buttonAction}
		<SecondaryButton on:click={buttonAction}>
			{buttonText}
		</SecondaryButton>
	{/if}
</div>

<style>
	.empty-state {
		text-align: center;
		padding: var(--spacing-4xl);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
		font-size: 1.125rem;
	}
</style>
