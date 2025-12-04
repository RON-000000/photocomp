<script>
	import { onMount } from 'svelte';
	import { getCompetitions } from '$lib/api.js';
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	import { Trophy, Filter } from 'lucide-svelte';
	
	let competitions = [];
	let filter = 'active'; // all, active, voting, completed
	let loading = true;
	let error = null;
	
	$: filteredCompetitions = filterCompetitions(competitions, filter);
	
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
		return comps.filter(c => {
			// Berechne Status basierend auf Datum
			const now = new Date();
			const deadline = new Date(c.deadline);
			
			if (now > deadline) {
				return currentFilter === 'completed';
			}
			
			return c.status === currentFilter;
		});
	}
	
	function getFilterCount(status) {
		if (status === 'all') return competitions.length;
		return filterCompetitions(competitions, status).length;
	}
</script>

<svelte:head>
	<title>Wettbewerbe - PhotoZürich</title>
</svelte:head>

<div class="page-wrapper">
	<div class="container">
		<!-- Page Header -->
		<div class="page-header">
			<div class="header-content">
				<div class="icon-wrapper">
					<Trophy size={32} />
				</div>
				<div>
					<h1>Wettbewerbe</h1>
					<p class="page-subtitle">
						Nimm an spannenden Foto-Wettbewerben teil und zeige dein Können
					</p>
				</div>
			</div>
		</div>
		
		{#if loading}
			<div class="loading-state">
				<span class="loading"></span>
				<p>Lade Wettbewerbe...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<p>Fehler beim Laden: {error}</p>
				<button class="btn btn-primary" on:click={loadCompetitions}>
					Erneut versuchen
				</button>
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
					{#each filteredCompetitions as competition}
						<CompetitionCard {competition} />
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>Keine Wettbewerbe in dieser Kategorie gefunden.</p>
					<button class="btn btn-secondary" on:click={() => filter = 'all'}>
						Alle Wettbewerbe anzeigen
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.page-wrapper {
		padding: var(--spacing-4xl) 0;
	}
	
	.page-header {
		margin-bottom: var(--spacing-4xl);
	}
	
	.header-content {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-lg);
	}
	
	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		color: var(--color-primary);
		flex-shrink: 0;
	}
	
	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: var(--spacing-xs);
		letter-spacing: -0.03em;
	}
	
	.page-subtitle {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.6;
	}
	
	.loading-state,
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
	
	.loading-state p,
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
	}
	
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
	
	/* Mobile Optimizations */
	@media (max-width: 768px) {
		.page-wrapper {
			padding: var(--spacing-3xl) 0;
		}
		
		.page-header {
			margin-bottom: var(--spacing-3xl);
		}
		
		.header-content {
			flex-direction: column;
			gap: var(--spacing-md);
		}
		
		.icon-wrapper {
			width: 56px;
			height: 56px;
		}
		
		.page-header h1 {
			font-size: 2rem;
		}
		
		.page-subtitle {
			font-size: 1rem;
		}
		
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
		
		.loading-state,
		.error-state {
			padding: var(--spacing-3xl);
			min-height: 300px;
		}
	}
	
	@media (max-width: 480px) {
		.page-header h1 {
			font-size: 1.75rem;
		}
		
		.filters {
			flex-direction: column;
		}
		
		.filter-btn {
			width: 100%;
		}
	}
</style>