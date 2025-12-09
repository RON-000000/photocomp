<script>
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import {
		getCompetitionById,
		getSubmissionsByCompetitionId,
		deleteCompetition,
	} from "$lib/api.js";
	import { formatDate } from "$lib/data/mockData";
	import { currentUser } from "$lib/stores/auth0.js";
	import SubmissionCard from "$lib/components/SubmissionCard.svelte";
	import Leaderboard from "$lib/components/Leaderboard.svelte";
	import {
		Calendar,
		Users,
		Image,
		Award,
		FileText,
		Scale,
		Upload,
		Edit3,
		Trash2,
		ArrowUpDown,
		ArrowUp,
		ArrowDown,
		Search,
	} from "lucide-svelte";

	let competition = null;
	let submissions = [];
	let loading = true;
	let error = null;
	let deleting = false;
	let sortBy = "date"; // date, votes, jury, comments
	let sortOrder = "desc"; // desc or asc
	let searchQuery = "";

	$: competitionId = $page.params.id;
	$: isAdmin = $currentUser && $currentUser.role === "admin";
	$: filteredSubmissions = filterSubmissions(submissions, searchQuery);
	$: sortedSubmissions = sortSubmissions(
		filteredSubmissions,
		sortBy,
		sortOrder,
	);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		error = null;

		try {
			competition = await getCompetitionById(competitionId);
			submissions = await getSubmissionsByCompetitionId(competitionId);
		} catch (err) {
			error = err.message;
			console.error("Error loading competition:", err);
		} finally {
			loading = false;
		}
	}

	function openSubmissionDetail(submission) {
		goto(`/submissions/${submission._id}`);
	}

	async function handleDeleteCompetition() {
		if (
			!confirm(
				"Möchtest du diese Competition wirklich löschen? Alle zugehörigen Submissions werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
			)
		) {
			return;
		}

		deleting = true;

		try {
			await deleteCompetition(competitionId);
			alert("Competition erfolgreich gelöscht! 🗑️");
			goto("/competitions");
		} catch (err) {
			console.error("Error deleting competition:", err);
			alert("Fehler beim Löschen: " + err.message);
		} finally {
			deleting = false;
		}
	}

	function handleEditCompetition() {
		goto(`/admin/competitions/${competitionId}/edit`);
	}

	// Berechne Status basierend auf Datum
	function getStatus(comp) {
		const now = new Date();
		const deadline = new Date(comp.deadline);

		if (now > deadline) return "completed";
		return comp.status || "active";
	}

	$: currentStatus = competition ? getStatus(competition) : null;
	$: statusBadge =
		currentStatus === "active"
			? "success"
			: currentStatus === "voting"
				? "warning"
				: "primary";
	$: statusText =
		currentStatus === "active"
			? "AKTIV"
			: currentStatus === "voting"
				? "VOTING"
				: "BEENDET";

	function filterSubmissions(subs, query) {
		if (!query.trim()) return subs;

		const lowerQuery = query.toLowerCase();
		return subs.filter(
			(sub) =>
				(sub.user?.username || "").toLowerCase().includes(lowerQuery) ||
				(sub.title || "").toLowerCase().includes(lowerQuery),
		);
	}

	function sortSubmissions(subs, sortType, order) {
		const sorted = [...subs];
		const multiplier = order === "desc" ? -1 : 1;

		switch (sortType) {
			case "date":
				return sorted.sort(
					(a, b) =>
						multiplier *
						(new Date(b.createdAt) - new Date(a.createdAt)),
				);
			case "votes":
				return sorted.sort(
					(a, b) =>
						multiplier *
						((b.votes?.community || 0) - (a.votes?.community || 0)),
				);
			case "jury":
				return sorted.sort(
					(a, b) =>
						multiplier *
						((b.votes?.jury || 0) - (a.votes?.jury || 0)),
				);
			case "comments":
				return sorted.sort(
					(a, b) =>
						multiplier *
						((b.comments?.length || 0) - (a.comments?.length || 0)),
				);
			default:
				return sorted;
		}
	}

	function toggleSortOrder() {
		sortOrder = sortOrder === "desc" ? "asc" : "desc";
	}
</script>

<svelte:head>
	<title>{competition?.title || "Wettbewerb"} - PhotoZürich</title>
</svelte:head>

{#if loading}
	<div class="loading-state">
		<span class="loading"></span>
		<p>Lade Wettbewerb...</p>
	</div>
{:else if error}
	<div class="container">
		<div class="error-state">
			<h2>Fehler</h2>
			<p>{error}</p>
			<a href="/competitions" class="btn btn-primary"
				>Zurück zu Wettbewerben</a
			>
		</div>
	</div>
{:else if competition}
	<!-- Hero Section -->
	<section class="competition-hero">
		<div class="hero-image">
			<img src={competition.imageUrl} alt={competition.title} />
			<div class="hero-overlay"></div>
		</div>
		<div class="container">
			<div class="hero-content">
				<div class="status-badge">
					<span class="badge badge-{statusBadge}">{statusText}</span>
				</div>
				<h1>{competition.title}</h1>
				<p class="hero-subtitle">{competition.description}</p>

				{#if isAdmin}
					<div class="admin-actions">
						<button
							on:click={handleEditCompetition}
							class="admin-button edit-button"
						>
							<Edit3 size={18} />
							<span>Bearbeiten</span>
						</button>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<div class="container">
		<div class="content-wrapper">
			<!-- Main Content -->
			<div class="main-content">
				<!-- Stats Section -->
				<div class="stats-section">
					<div class="stat-item">
						<Calendar size={20} />
						<div>
							<div class="stat-label">Deadline</div>
							<div class="stat-value">
								{formatDate(competition.deadline)}
							</div>
						</div>
					</div>
					<div class="stat-item">
						<Users size={20} />
						<div>
							<div class="stat-label">Teilnehmer</div>
							<div class="stat-value">
								{new Set(
									submissions.map(
										(s) => s.user?._id || s.userId,
									),
								).size}
							</div>
						</div>
					</div>
					<div class="stat-item">
						<Image size={20} />
						<div>
							<div class="stat-label">Beiträge</div>
							<div class="stat-value">
								{competition.submissionCount || 0}
							</div>
						</div>
					</div>
				</div>

				{#if currentStatus === "active"}
					<div class="cta-section">
						<a
							href="/submit?competition={competition._id}"
							class="btn btn-primary btn-lg"
						>
							<Upload size={20} />
							<span>Foto einreichen</span>
						</a>
					</div>
				{/if}

				<!-- Mobile Sidebar (only visible on mobile) -->
				<aside class="sidebar-mobile">
					<div class="info-card">
						<h3>
							<FileText size={20} />
							<span>Details</span>
						</h3>

						<div class="info-section">
							<div class="info-label">Thema</div>
							<div class="info-value">{competition.theme}</div>
						</div>

						<div class="info-section">
							<div class="info-label">Start</div>
							<div class="info-value">
								{formatDate(competition.startDate)}
							</div>
						</div>

						<div class="info-section">
							<div class="info-label">Deadline</div>
							<div class="info-value">
								{formatDate(competition.deadline)}
							</div>
						</div>
					</div>

					<div class="info-card">
						<h3>
							<Award size={20} />
							<span>Preise</span>
						</h3>

						<ul class="prizes-list">
							{#each competition.prizes as prize, index}
								<li>
									<span class="prize-position"
										>{index + 1}.</span
									>
									<span>{prize}</span>
								</li>
							{/each}
						</ul>
					</div>

					<div class="info-card">
						<h3>
							<Scale size={20} />
							<span>Regeln</span>
						</h3>

						<ul class="rules-list">
							{#each Array.isArray(competition.rules) ? competition.rules : competition.rules ? competition.rules
											.split("\n")
											.filter( (r) => r.trim(), ) : [] as rule}
								<li>{rule}</li>
							{/each}
						</ul>
					</div>

					{#if competition.juryMembers && competition.juryMembers.length > 0}
						<div class="info-card">
							<h3>
								<Users size={20} />
								<span>Jury</span>
							</h3>

							<ul class="jury-list">
								{#each competition.juryMembers as juryMember}
									<li>
										<a
											href="/profile/{juryMember}"
											class="jury-link">@{juryMember}</a
										>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</aside>

				<!-- Leaderboard -->
				<section class="section">
					<Leaderboard
						competitionId={competition._id}
						{submissions}
						{competition}
					/>
				</section>

				<!-- Submissions Gallery -->
				<section class="section">
					<div class="section-header">
						<h2>Alle Beiträge</h2>
						<span class="count">{submissions.length}</span>
					</div>

					{#if submissions.length > 0}
						<!-- Search and Sort Section -->
						<div class="filter-sort-section">
							<!-- Search Bar -->
							<div class="search-section">
								<div class="search-input-wrapper">
									<Search size={18} />
									<input
										type="text"
										bind:value={searchQuery}
										placeholder="Nach Username oder Titel suchen..."
										class="search-input"
									/>
									{#if searchQuery}
										<button
											class="clear-search"
											on:click={() => (searchQuery = "")}
										>
											×
										</button>
									{/if}
								</div>
								{#if searchQuery && filteredSubmissions.length !== submissions.length}
									<span class="search-results"
										>{filteredSubmissions.length} von {submissions.length}
										Ergebnissen</span
									>
								{/if}
							</div>

							<!-- Sort Options -->
							<div class="sort-section">
								<div class="sort-header">
									<ArrowUpDown size={16} />
									<span>Sortieren nach</span>
								</div>
								<div class="sort-controls">
									<div class="sort-buttons">
										<button
											class="sort-btn"
											class:active={sortBy === "date"}
											on:click={() => (sortBy = "date")}
										>
											Datum
										</button>
										<button
											class="sort-btn"
											class:active={sortBy === "votes"}
											on:click={() => (sortBy = "votes")}
										>
											Stimmen
										</button>
										<button
											class="sort-btn"
											class:active={sortBy === "jury"}
											on:click={() => (sortBy = "jury")}
										>
											Jury Bewertung
										</button>
										<button
											class="sort-btn"
											class:active={sortBy === "comments"}
											on:click={() =>
												(sortBy = "comments")}
										>
											Kommentare
										</button>
									</div>
									<button
										class="sort-order-btn"
										on:click={toggleSortOrder}
										title={sortOrder === "desc"
											? "Absteigend"
											: "Aufsteigend"}
									>
										{#if sortOrder === "desc"}
											<ArrowDown size={18} />
										{:else}
											<ArrowUp size={18} />
										{/if}
									</button>
								</div>
							</div>
						</div>

						<div class="submissions-grid">
							{#each sortedSubmissions as submission}
								<button
									class="submission-wrapper"
									on:click={() =>
										openSubmissionDetail(submission)}
								>
									<SubmissionCard
										{submission}
										showVoting={currentStatus === "voting"}
									/>
								</button>
							{/each}
						</div>
					{:else}
						<div class="empty-state">
							<p>Noch keine Submissions.</p>
							{#if currentStatus === "active"}
								<a
									href="/submit?competition={competition._id}"
									class="btn btn-primary"
								>
									Sei der Erste!
								</a>
							{/if}
						</div>
					{/if}
				</section>
			</div>

			<!-- Sidebar -->
			<aside class="sidebar">
				<div class="info-card">
					<h3>
						<FileText size={20} />
						<span>Details</span>
					</h3>

					<div class="info-section">
						<div class="info-label">Thema</div>
						<div class="info-value">{competition.theme}</div>
					</div>

					<div class="info-section">
						<div class="info-label">Start</div>
						<div class="info-value">
							{formatDate(competition.startDate)}
						</div>
					</div>

					<div class="info-section">
						<div class="info-label">Deadline</div>
						<div class="info-value">
							{formatDate(competition.deadline)}
						</div>
					</div>
				</div>

				<div class="info-card">
					<h3>
						<Award size={20} />
						<span>Preise</span>
					</h3>

					<ul class="prizes-list">
						{#each competition.prizes as prize, index}
							<li>
								<span class="prize-position">{index + 1}.</span>
								<span>{prize}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="info-card">
					<h3>
						<Scale size={20} />
						<span>Regeln</span>
					</h3>

					<ul class="rules-list">
						{#each Array.isArray(competition.rules) ? competition.rules : competition.rules ? competition.rules
										.split("\n")
										.filter((r) => r.trim()) : [] as rule}
							<li>{rule}</li>
						{/each}
					</ul>
				</div>

				{#if competition.juryMembers && competition.juryMembers.length > 0}
					<div class="info-card">
						<h3>
							<Users size={20} />
							<span>Jury</span>
						</h3>

						<ul class="jury-list">
							{#each competition.juryMembers as juryMember}
								<li>
									<a
										href="/profile/{juryMember}"
										class="jury-link">@{juryMember}</a
									>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</aside>
		</div>
	</div>
{:else}
	<div class="container">
		<div class="error-state">
			<h2>Wettbewerb nicht gefunden</h2>
			<p>Der gesuchte Wettbewerb existiert nicht.</p>
			<a href="/competitions" class="btn btn-primary"
				>Zurück zu Wettbewerben</a
			>
		</div>
	</div>
{/if}

<style>
	/* Loading & Error States */
	.loading-state {
		text-align: center;
		padding: var(--spacing-4xl);
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-lg);
	}

	.loading-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}

	.error-state {
		text-align: center;
		padding: var(--spacing-4xl);
		min-height: 50vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-lg);
	}

	.error-state h2 {
		margin-bottom: var(--spacing-sm);
	}

	.error-state p {
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Hero Section */
	.competition-hero {
		position: relative;
		margin-bottom: var(--spacing-4xl);
	}

	.hero-image {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 500px;
		overflow: hidden;
	}

	.hero-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.3) 0%,
			rgba(0, 0, 0, 0.7) 100%
		);
	}

	.hero-content {
		position: relative;
		padding-top: 200px;
		padding-bottom: var(--spacing-3xl);
		color: white;
		max-width: 800px;
	}

	.status-badge {
		margin-bottom: var(--spacing-lg);
	}

	.hero-content h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: var(--spacing-md);
		color: white;
		letter-spacing: -0.03em;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.hero-subtitle {
		font-size: 1.25rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.95);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		margin: 0;
	}

	/* Content Layout */
	.content-wrapper {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: var(--spacing-3xl);
		margin-top: var(--spacing-4xl);
	}

	.main-content {
		min-width: 0;
	}

	/* Stats Section */
	.stats-section {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-3xl);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-xl);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.stat-item :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.stat-label {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	/* CTA Section */
	.cta-section {
		margin-bottom: var(--spacing-3xl);
		text-align: center;
		padding: var(--spacing-2xl);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 2px dashed var(--color-border);
	}

	.btn-lg {
		padding: var(--spacing-md) var(--spacing-2xl);
		font-size: 1rem;
	}

	/* Sections */
	.section {
		margin-bottom: var(--spacing-4xl);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-2xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.section-header h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}

	.section-header .count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0 var(--spacing-sm);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	/* Filter and Sort Section */
	.filter-sort-section {
		margin-bottom: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	/* Search Section */
	.search-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input-wrapper :global(svg) {
		position: absolute;
		left: var(--spacing-md);
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 3rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-family: var(--font-sans);
		transition: border-color 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.clear-search {
		position: absolute;
		right: var(--spacing-md);
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.clear-search:hover {
		background: var(--color-surface);
		color: var(--color-text-primary);
	}

	.search-results {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		padding-left: var(--spacing-sm);
	}

	/* Sort Section */
	.sort-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.sort-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.sort-controls {
		display: flex;
		gap: var(--spacing-md);
		align-items: center;
	}

	.sort-buttons {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		flex: 1;
	}

	.sort-btn {
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

	.sort-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: var(--color-surface);
	}

	.sort-btn.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.sort-order-btn {
		padding: var(--spacing-sm);
		border: 1px solid var(--color-border);
		background: white;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s;
		color: var(--color-text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		flex-shrink: 0;
	}

	.sort-order-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: var(--color-surface);
	}

	/* Submissions Grid */
	.submissions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-2xl);
		/* Safari grid fixes */
		align-items: start;
	}

	.submission-wrapper {
		all: unset;
		cursor: pointer;
		display: block;
		/* Safari fixes - prevent layout recalculation loop */
		-webkit-transform: translateZ(0);
		contain: layout;
		min-width: 0;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-4xl);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 2px dashed var(--color-border);
	}

	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
		font-size: 1.125rem;
	}

	/* Sidebar */
	.sidebar {
		position: sticky;
		top: 100px;
		align-self: start;
	}

	/* Mobile Sidebar - hidden on desktop, shown on mobile */
	.sidebar-mobile {
		display: none;
	}

	.info-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		border: 1px solid var(--color-border);
		margin-bottom: var(--spacing-lg);
	}

	.info-card:last-child {
		margin-bottom: 0;
	}

	.info-card h3 {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text-primary);
	}

	.info-card h3 :global(svg) {
		color: var(--color-text-muted);
	}

	.info-section {
		margin-bottom: var(--spacing-md);
	}

	.info-section:last-child {
		margin-bottom: 0;
	}

	.info-label {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
	}

	.info-value {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.prizes-list,
	.rules-list,
	.jury-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.prizes-list li,
	.rules-list li {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
		padding: var(--spacing-sm) 0;
		border-bottom: 1px solid var(--color-border);
	}

	.prizes-list li:last-child,
	.rules-list li:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}

	.prizes-list li {
		display: flex;
		gap: var(--spacing-sm);
	}

	.prize-position {
		font-weight: 600;
		color: var(--color-primary);
	}

	.jury-list li {
		margin-bottom: var(--spacing-xs);
	}

	.jury-link {
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		font-weight: 500;
		text-decoration: none;
		transition: text-decoration 0.2s;
	}

	.jury-link:hover {
		text-decoration: underline;
	}

	/* Mobile Optimizations */
	@media (max-width: 1024px) {
		.content-wrapper {
			grid-template-columns: 1fr;
		}

		/* Hide desktop sidebar on mobile */
		.sidebar {
			display: none;
		}

		/* Show mobile sidebar on mobile */
		.sidebar-mobile {
			display: block;
			margin-bottom: var(--spacing-2xl);
		}
	}

	@media (max-width: 768px) {
		.hero-image {
			height: 400px;
		}

		.hero-content {
			padding-top: 150px;
			padding-bottom: var(--spacing-2xl);
		}

		.hero-content h1 {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.stats-section {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.submissions-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}

		.close-btn {
			top: var(--spacing-md);
			right: var(--spacing-md);
			width: 40px;
			height: 40px;
		}

		.filter-sort-section {
			padding: var(--spacing-md);
		}

		.sort-btn {
			font-size: 0.875rem;
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.sort-controls {
			gap: var(--spacing-sm);
		}
	}

	@media (max-width: 480px) {
		.hero-image {
			height: 300px;
		}

		.hero-content {
			padding-top: 100px;
		}

		.hero-content h1 {
			font-size: 1.5rem;
		}
	}

	.admin-actions {
		display: flex;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-lg);
		padding-top: var(--spacing-lg);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.admin-button {
		all: unset;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: 600;
		font-size: 0.875rem;
		backdrop-filter: blur(8px);
	}

	.edit-button {
		background: rgba(255, 255, 255, 0.95);
		color: var(--color-primary);
		border: 1px solid rgba(255, 255, 255, 0.95);
	}

	.edit-button:hover:not(:disabled) {
		background: white;
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.admin-button.delete-button {
		background: rgba(229, 62, 62, 0.95);
		color: white;
		border: 1px solid rgba(229, 62, 62, 0.95);
	}

	.admin-button.delete-button:hover:not(:disabled) {
		background: rgba(197, 48, 48, 1);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.admin-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.admin-actions {
			flex-direction: column;
			width: 100%;
			max-width: 100%;
			gap: var(--spacing-xs);
			box-sizing: border-box;
		}

		.admin-button {
			width: 100%;
			max-width: 100%;
			justify-content: center;
			padding: var(--spacing-sm) var(--spacing-md);
			font-size: 0.8125rem;
			box-sizing: border-box;
		}

		.admin-button span {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.hero-content {
			max-width: 100%;
			padding-left: var(--spacing-md);
			padding-right: var(--spacing-md);
		}
	}
</style>
