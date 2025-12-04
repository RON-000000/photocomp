<script>
	import { formatDate } from '$lib/data/mockData';
	import { Users, Image, Calendar } from 'lucide-svelte';

	export let competition;
	export let juryMode = false; // Optional: true wenn von Jury Dashboard aufgerufen

	$: targetUrl = juryMode ? `/jury/competitions/${competition._id}` : `/competitions/${competition._id}`;

	// Berechne Status basierend auf Datum
	$: currentStatus = calculateStatus(competition);
	$: statusBadge = currentStatus === 'active' ? 'success' : 
	                 currentStatus === 'voting' ? 'warning' : 'primary';
	$: statusText = currentStatus === 'active' ? 'AKTIV' : 
	                currentStatus === 'voting' ? 'VOTING' : 'BEENDET';
	
	function calculateStatus(comp) {
		const now = new Date();
		const deadline = new Date(comp.deadline);
		const startDate = new Date(comp.startDate);
		
		// Wenn noch nicht gestartet
		if (now < startDate) {
			return 'upcoming';
		}
		
		// Wenn abgelaufen
		if (now > deadline) {
			return 'completed';
		}
		
		// Ansonsten nutze den gespeicherten Status aus der DB
		// oder default zu 'active'
		return comp.status || 'active';
	}
	
	// Formatiere Datum für Anzeige
	function formatDeadline(dateString) {
		const date = new Date(dateString);
		const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
		return date.toLocaleDateString('de-CH', options);
	}
</script>

<a href={targetUrl} class="competition-card">
	<div class="card-image-wrapper">
		<img src={competition.imageUrl} alt={competition.title} class="card-image" />
		<div class="card-overlay">
			<span class="badge badge-{statusBadge}">{statusText}</span>
		</div>
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
		display: block;
		background: white;
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--color-border);
		transition: all 0.3s ease;
		text-decoration: none;
		color: inherit;
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
	}
	
	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s ease;
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