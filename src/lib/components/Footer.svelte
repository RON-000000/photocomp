<script>
	import { Instagram, Twitter, Mail, Heart } from 'lucide-svelte';
</script>

<footer class="footer">
	<div class="container">
		<div class="footer-content">
			<!-- Brand Section -->
			<div class="footer-section">
				<h3 class="footer-brand">PhotoZürich</h3>
				<p class="footer-tagline">
					Die Community-Plattform für Zürcher Fotografen
				</p>
				<div class="social-links">
					<a href="https://instagram.com" target="_blank" rel="noopener" class="social-link">
						<Instagram size={20} />
					</a>
					<a href="https://twitter.com" target="_blank" rel="noopener" class="social-link">
						<Twitter size={20} />
					</a>
					<a href="mailto:info@photozurich.ch" class="social-link">
						<Mail size={20} />
					</a>
				</div>
			</div>
			
			<!-- Navigation Section -->
			<div class="footer-section">
				<h4>Plattform</h4>
				<ul class="footer-links">
					<li><a href="/competitions">Wettbewerbe</a></li>
					<li><a href="/archive">Archiv</a></li>
					<li><a href="/submit">Foto einreichen</a></li>
				</ul>
			</div>
			
			<!-- Community Section -->
			<div class="footer-section">
				<h4>Community</h4>
				<ul class="footer-links">
					<li><a href="/about">Über uns</a></li>
					<li><a href="/guidelines">Richtlinien</a></li>
					<li><a href="/faq">FAQ</a></li>
				</ul>
			</div>
			
			<!-- Legal Section -->
			<div class="footer-section">
				<h4>Rechtliches</h4>
				<ul class="footer-links">
					<li><a href="/impressum">Impressum</a></li>
					<li><a href="/datenschutz">Datenschutz</a></li>
					<li><a href="/agb">AGB</a></li>
				</ul>
			</div>
		</div>
		
		<div class="footer-bottom">
			<p class="copyright">
				© {new Date().getFullYear()} PhotoZürich. Alle Rechte vorbehalten.
			</p>
			<p class="made-with">
				Gemacht mit <Heart size={14} class="heart" /> in Zürich
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		background: white;
		border-top: 1px solid var(--color-border);
		padding: var(--spacing-4xl) 0 var(--spacing-2xl);
		margin-top: var(--spacing-4xl);
	}
	
	.footer-content {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
		gap: var(--spacing-3xl);
		margin-bottom: var(--spacing-3xl);
		padding-bottom: var(--spacing-3xl);
		border-bottom: 1px solid var(--color-border);
	}
	
	.footer-section h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: var(--spacing-md);
		color: var(--color-text-primary);
	}
	
	.footer-section h4 {
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: var(--spacing-md);
		color: var(--color-text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.footer-brand {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
	}
	
	.footer-tagline {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
		line-height: 1.6;
		max-width: 280px;
	}
	
	.social-links {
		display: flex;
		gap: var(--spacing-md);
	}
	
	.social-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		transition: all 0.2s;
	}
	
	.social-link:hover {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: white;
		transform: translateY(-2px);
	}
	
	.footer-links {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.footer-links li {
		margin-bottom: var(--spacing-sm);
	}
	
	.footer-links a {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		transition: color 0.2s;
	}
	
	.footer-links a:hover {
		color: var(--color-primary);
	}
	
	.footer-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}
	
	.copyright,
	.made-with {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
	}
	
	.made-with {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	.made-with :global(.heart) {
		color: #ef4444;
		animation: heartbeat 1.5s ease-in-out infinite;
	}
	
	@keyframes heartbeat {
		0%, 100% {
			transform: scale(1);
		}
		10%, 30% {
			transform: scale(1.1);
		}
		20%, 40% {
			transform: scale(1);
		}
	}
	
	/* Mobile Optimizations */
	@media (max-width: 1024px) {
		.footer-content {
			grid-template-columns: 1fr 1fr;
			gap: var(--spacing-2xl);
		}
	}
	
	@media (max-width: 768px) {
		.footer {
			padding: var(--spacing-3xl) 0 var(--spacing-xl);
			margin-top: var(--spacing-3xl);
		}
		
		.footer-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-2xl);
			margin-bottom: var(--spacing-2xl);
			padding-bottom: var(--spacing-2xl);
		}
		
		.footer-bottom {
			flex-direction: column;
			text-align: center;
			gap: var(--spacing-sm);
		}
	}
</style>