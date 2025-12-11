<script>
	import { onMount } from 'svelte';
	import { getCompetitions } from '$lib/api.js';
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SecondaryButton from '$lib/components/SecondaryButton.svelte';
	import { Filter } from 'lucide-svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';

	let competitions = [];
	let filter = 'active'; // all, active, voting, completed
	let loading = true;
	let error = null;
	let visibleCount = 6; // Initial number of competitions to show
	let loadingMore = false;
	
	$: filteredCompetitions = filterCompetitions(competitions, filter);
	$: visibleCompetitions = filteredCompetitions.slice(0, visibleCount);
	$: hasMore = visibleCount < filteredCompetitions.length;

	// Reset visible count when filter changes
	$: if (filter) {
		visibleCount = 6;
	}
	
	onMount(async () => {
		await loadCompetitions();
	});
	
	async function loadCompetitions() {
		loading = true;
		error = null;
		
		try {
			competitions = await getCompetitions();
		} catch (err) {
			error = err.message;
			console.error('Error loading competitions:', err);
		} finally {
			loading = false;
		}
	}
	
	function filterCompetitions(comps, currentFilter) {
		if (currentFilter === 'all') return comps;
		return comps.filter(c => c.status === currentFilter);
	}
	
	function getFilterCount(status) {
		if (status === 'all') return competitions.length;
		return filterCompetitions(competitions, status).length;
	}

	async function loadMore() {
		loadingMore = true;
		// Simulate loading delay for better UX
		await new Promise(resolve => setTimeout(resolve, 300));
		visibleCount += 6;
		loadingMore = false;
	}
</script>

<svelte:head>
	<title>Wettbewerbe - PhotoZürich</title>
</svelte:head>

<div class="page-wrapper">
	<div class="container">
		<!-- Page Header -->
		<header class="page-header">
			<h1>Wettbewerbe</h1>
			<p>Nimm an spannenden Foto-Wettbewerben teil und zeige dein Können</p>
		</header>
		
		{#if loading}
			<LoadingSpinner message="Lade Wettbewerbe..." />
		{:else if error}
			<div class="error-state">
				<p>Fehler beim Laden: {error}</p>
				<PrimaryButton on:click={loadCompetitions}>
					Erneut versuchen
				</PrimaryButton>
			</div>
		{:else}
			<!-- Filters -->
			<div class="filters-section">
				<div class="filters-header">
					<Filter size={18} />
					<span>Filter</span>
				</div>
				
				<div class="filters">
					<button
						class="filter-btn"
						class:active={filter === 'active'}
						on:click={() => filter = 'active'}
					>
						Aktiv
						<span class="count">{getFilterCount('active')}</span>
					</button>
					<button
						class="filter-btn"
						class:active={filter === 'voting'}
						on:click={() => filter = 'voting'}
					>
						Voting
						<span class="count">{getFilterCount('voting')}</span>
					</button>
					<button
						class="filter-btn"
						class:active={filter === 'completed'}
						on:click={() => filter = 'completed'}
					>
						Beendet
						<span class="count">{getFilterCount('completed')}</span>
					</button>
					<button
						class="filter-btn"
						class:active={filter === 'all'}
						on:click={() => filter = 'all'}
					>
						Alle
						<span class="count">{getFilterCount('all')}</span>
					</button>
				</div>
			</div>
			
			<!-- Competitions Grid -->
			{#if filteredCompetitions.length > 0}
				<div class="competitions-grid">
					{#each visibleCompetitions as competition}
						<CompetitionCard {competition} />
					{/each}
				</div>

				<!-- Load More Button -->
				{#if hasMore}
					<div class="load-more-wrapper">
						<SecondaryButton
							on:click={loadMore}
							disabled={loadingMore}
						>
							{loadingMore ? 'Lädt...' : 'Weitere laden'}
						</SecondaryButton>
					</div>
				{/if}
			{:else}
				<EmptyState
					message="Keine Wettbewerbe in dieser Kategorie gefunden."
					actionText="Alle Wettbewerbe anzeigen"
					onAction={() => filter = 'all'}
				/>
			{/if}
		{/if}
	</div>
</div>

<style>
	.page-wrapper {
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

	.error-state {
		text-align: center;
		padding: var(--spacing-4xl);
		min-height: 400px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-lg);
	}

	.error-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}

	.filters-section {
		margin-bottom: var(--spacing-3xl);
		padding: var(--spacing-xl);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}
	
	.filters-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-lg);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.filters {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}
	
	.filter-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		border: 1px solid var(--color-border);
		background: white;
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 0.9375rem;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--color-text-secondary);
		font-family: var(--font-sans);
	}
	
	.filter-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: var(--color-surface);
	}
	
	.filter-btn.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}
	
	.filter-btn .count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		padding: 0 var(--spacing-xs);
		background: rgba(0, 0, 0, 0.1);
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
		font-weight: 600;
	}
	
	.filter-btn.active .count {
		background: rgba(255, 255, 255, 0.2);
	}
	
	.competitions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		gap: var(--spacing-2xl);
		/* Safari grid fixes */
		align-items: start;
	}

	.load-more-wrapper {
		display: flex;
		justify-content: center;
		margin-top: var(--spacing-3xl);
		padding-top: var(--spacing-2xl);
	}

	/* Mobile Optimizations */
	@media (max-width: 768px) {
		.filters-section {
			padding: var(--spacing-lg);
			margin-bottom: var(--spacing-2xl);
		}

		.filters {
			gap: var(--spacing-sm);
		}

		.filter-btn {
			flex: 1;
			min-width: 0;
			justify-content: center;
		}

		.competitions-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
	}


	@media (max-width: 480px) {
		.filters {
			flex-direction: column;
		}

		.filter-btn {
			width: 100%;
		}
	}
</style>