<script>
	import { formatDate } from "$lib/data/mockData";
	import { Users, Image, Calendar, Clock } from "lucide-svelte";

	export let competition;
	export let juryMode = false; // Optional: true wenn von Jury Dashboard aufgerufen
	export let showCountdown = true; // Countdown anzeigen für aktive Wettbewerbe

	$: targetUrl = juryMode
		? `/jury/competitions/${competition._id}`
		: `/competitions/${competition._id}`;

	// Verwende den Status direkt aus der Datenbank
	$: currentStatus = competition.status || "active";
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

	// Countdown berechnen
	$: countdown = getCountdown(competition.deadline);
	$: showCountdownBadge =
		showCountdown && currentStatus === "active" && countdown;

	function getCountdown(deadline) {
		const now = new Date();
		const end = new Date(deadline);
		const diff = end - now;

		if (diff <= 0) return null;

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days > 0) return `Noch ${days} Tag${days > 1 ? "e" : ""}`;

		const hours = Math.floor(diff / (1000 * 60 * 60));
		if (hours > 0) return `Noch ${hours} Std`;

		const minutes = Math.floor(diff / (1000 * 60));
		return `Noch ${minutes} Min`;
	}

	// Formatiere Datum für Anzeige
	function formatDeadline(dateString) {
		const date = new Date(dateString);
		const options = { day: "2-digit", month: "2-digit", year: "numeric" };
		return date.toLocaleDateString("de-CH", options);
	}
</script>

<a href={targetUrl} class="competition-card">
	<div class="card-image-wrapper">
		<img
			src={competition.imageUrl}
			alt={competition.title}
			class="card-image"
		/>
		<div class="card-overlay">
			<span class="badge badge-{statusBadge}">{statusText}</span>
		</div>
		{#if showCountdownBadge}
			<div class="countdown-badge">
				<Clock size={14} />
				<span>{countdown}</span>
			</div>
		{/if}
	</div>

	<div class="card-content">
		<h3>{competition.title}</h3>
		<p class="theme">{competition.theme}</p>

		<div class="meta">
			<div class="meta-item">
				<Users size={16} />
				<span>{competition.participantCount || 0}</span>
			</div>
			<div class="meta-item">
				<Image size={16} />
				<span>{competition.submissionCount || 0}</span>
			</div>
			<div class="meta-item">
				<Calendar size={16} />
				<span>{formatDeadline(competition.deadline)}</span>
			</div>
		</div>
	</div>
</a>

<style>
	.competition-card {
		display: flex;
		flex-direction: column;
		background: white;
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--color-border);
		transition: all 0.3s ease;
		text-decoration: none;
		color: inherit;
		/* Safari fixes - prevent layout recalculation loop */
		-webkit-transform: translateZ(0);
		min-width: 0;
		contain: layout;
	}

	.competition-card:hover {
		border-color: var(--color-primary);
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
	}

	.card-image-wrapper {
		position: relative;
		overflow: hidden;
		aspect-ratio: 16 / 9;
		background: var(--color-surface);
		/* Safari fallback for aspect-ratio */
		min-height: 0;
	}

	/* Safari aspect-ratio fallback */
	@supports not (aspect-ratio: 16 / 9) {
		.card-image-wrapper {
			padding-top: 56.25%; /* 9/16 = 0.5625 */
		}

		.card-image-wrapper .card-image {
			position: absolute;
			top: 0;
			left: 0;
		}
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s ease;
		/* Prevent Safari from resizing */
		flex-shrink: 0;
	}

	.competition-card:hover .card-image {
		transform: scale(1.05);
	}

	.card-overlay {
		position: absolute;
		top: var(--spacing-lg);
		right: var(--spacing-lg);
		z-index: 1;
	}

	.countdown-badge {
		position: absolute;
		top: var(--spacing-lg);
		left: var(--spacing-lg);
		z-index: 1;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(8px);
		border-radius: var(--radius-md);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.countdown-badge :global(svg) {
		flex-shrink: 0;
	}

	.card-content {
		padding: var(--spacing-xl);
	}

	.card-content h3 {
		margin-bottom: var(--spacing-xs);
		color: var(--color-text-primary);
		font-size: 1.125rem;
		font-weight: 600;
	}

	.theme {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-lg);
		font-weight: 400;
	}

	.meta {
		display: flex;
		gap: var(--spacing-lg);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--color-border);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.meta-item :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	/* Mobile Optimization */
	@media (max-width: 640px) {
		.meta {
			flex-wrap: wrap;
			gap: var(--spacing-md);
		}

		.meta-item {
			font-size: 0.8125rem;
		}
	}
</style>
