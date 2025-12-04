<script>
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores/auth0';
	import { Trophy, Filter, Award } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	import { formatDate } from '$lib/data/mockData';

	let competitions = [];
	let loading = true;
	let error = null;
	let filter = 'voting'; // all, active, voting, completed

	$: isJury = $currentUser && ($currentUser.role === 'jury' || $currentUser.role === 'admin');
	$: filteredCompetitions = filterCompetitions(competitions, filter);

	onMount(async () => {
		if (!$currentUser) {
			goto('/');
			return;
		}

		if (!isJury) {
			alert('Du hast keine Berechtigung für diese Seite.');
			goto('/');
			return;
		}

		await loadCompetitions();
	});

	async function loadCompetitions() {
		loading = true;
		error = null;

		try {
			// Load competitions where current user is a jury member
			const response = await fetch(`/api/jury/competitions?username=${$currentUser.username}`);
			if (response.ok) {
				competitions = await response.json();
			} else {
				error = 'Fehler beim Laden der Competitions';
			}
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
	<title>Jury Dashboard - PhotoZürich</title>
</svelte:head>

<div class="jury-page">
	<div class="container">
		<header class="page-header">
			<h1>Jury Dashboard</h1>
			<p>Willkommen zurück, {$currentUser?.name}!</p>
		</header>

		{#if loading}
			<div class="loading-state">
				<span class="loading"></span>
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
				<h2 class="filters-header">Wettbewerbe</h2>

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
						<CompetitionCard {competition} juryMode={true} />
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
	.jury-page {
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

	/* Loading State */
	.loading-state {
		display: flex;
		justify-content: center;
		padding: var(--spacing-4xl);
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

	/* Filters Section */
	.filters-section {
		margin-bottom: var(--spacing-2xl);
	}

	.filters-header {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 var(--spacing-lg) 0;
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
