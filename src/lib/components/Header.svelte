<script>
	import { currentUser, logout } from '$lib/stores/auth';
	import { Home, Award, Upload, Archive, User, LogOut } from 'lucide-svelte';
</script>

<header class="header">
	<div class="container">
		<nav class="nav">
			<a href="/" class="logo">
				PhotoZürich
			</a>
			
			<div class="nav-links">
				<a href="/" class="nav-link">
					<Home size={18} />
					<span>Home</span>
				</a>
				<a href="/competitions" class="nav-link">
					<Award size={18} />
					<span>Wettbewerbe</span>
				</a>
				<a href="/archive" class="nav-link">
					<Archive size={18} />
					<span>Archiv</span>
				</a>
			</div>
			
			<div class="nav-actions">
				{#if $currentUser}
					<a href="/submit" class="btn btn-primary btn-sm">
						<Upload size={16} />
						<span>Einreichen</span>
					</a>
					<a href="/profile/{$currentUser.username}" class="nav-link">
						<img src={$currentUser.avatar} alt={$currentUser.name} class="user-avatar" />
						<span>{$currentUser.username}</span>
					</a>
					<button class="btn btn-secondary btn-sm" on:click={logout}>
						<LogOut size={16} />
					</button>
				{:else}
					<button class="btn btn-primary btn-sm">
						<User size={16} />
						<span>Login</span>
					</button>
				{/if}
			</div>
		</nav>
	</div>
</header>

<style>
	.header {
		background: white;
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.95);
	}
	
	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-lg) 0;
		gap: var(--spacing-xl);
	}
	
	.logo {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-primary);
		letter-spacing: -0.02em;
	}
	
	.nav-links {
		display: flex;
		gap: var(--spacing-md);
		flex: 1;
	}
	
	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		font-weight: 500;
		border-radius: var(--radius-md);
		transition: all 0.2s;
	}
	
	.nav-link:hover {
		color: var(--color-primary);
		background: var(--color-surface);
	}
	
	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}
	
	.user-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		object-fit: cover;
	}
	
	@media (max-width: 768px) {
		.nav-link span {
			display: none;
		}
		
		.logo {
			font-size: 1rem;
		}
		
		.nav-links {
			gap: var(--spacing-xs);
		}
	}
</style>