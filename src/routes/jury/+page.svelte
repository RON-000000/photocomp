<script>
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores/auth0';
	import { Trophy, Filter, Award, CheckCircle, Clock } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	let competitions = [];
	let loading = true;
	let error = null;
	let filter = 'voting'; // all, active, voting, completed

	$: isJury = $currentUser && ($currentUser.role === 'jury' || $currentUser.role === 'admin');
	$: filteredCompetitions = filterCompetitions(competitions, filter);

	// Calculate stats from competitions data
	$: stats = {
		totalCompetitions: competitions.length,
		activeCompetitions: competitions.filter(c => c.status === 'active').length,
		votingCompetitions: competitions.filter(c => c.status === 'voting').length,
		completedCompetitions: competitions.filter(c => c.status === 'completed').length
	};

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
		return comps.filter(c => c.status === currentFilter);
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
			<LoadingSpinner text="Lade Wettbewerbe..." />
		{:else if error}
			<div class="error-state">
				<p>Fehler beim Laden: {error}</p>
				<button class="btn btn-primary" on:click={loadCompetitions}>
					Erneut versuchen
				</button>
			</div>
		{:else}
			<!-- Stats Grid -->
			<div class="stats-grid">
				<StatCard icon={Trophy} value={stats.totalCompetitions} label="Meine Wettbewerbe" />
				<StatCard icon={Clock} value={stats.activeCompetitions} label="Aktiv" />
				<StatCard icon={Award} value={stats.votingCompetitions} label="Voting" />
				<StatCard icon={CheckCircle} value={stats.completedCompetitions} label="Beendet" />
			</div>

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
				<EmptyState
					message="Keine Wettbewerbe in dieser Kategorie gefunden."
					buttonText="Alle Wettbewerbe anzeigen"
					buttonAction={() => filter = 'all'}
				/>
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

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
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
