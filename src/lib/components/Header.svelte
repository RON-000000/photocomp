<script>
	import {
		currentUser,
		login,
		logout,
		isAuthenticated,
	} from "$lib/stores/auth0";
	import { Camera, Menu, X, User, LogOut, Settings, Award } from "lucide-svelte";

	let mobileMenuOpen = false;
	let userMenuOpen = false;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		if (mobileMenuOpen) {
			userMenuOpen = false;
		}
	}

	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}

	function handleLogin() {
		login();
	}

	function handleLogout() {
		logout();
		userMenuOpen = false;
	}

	function handleClickOutside(event) {
		const target = event.target;

		// Close user menu if clicking outside
		if (!target.closest(".user-menu-wrapper")) {
			userMenuOpen = false;
		}

		// Close mobile menu if clicking outside
		if (!target.closest(".nav-links") && !target.closest(".mobile-menu-btn")) {
			mobileMenuOpen = false;
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleScroll() {
		if (mobileMenuOpen) {
			mobileMenuOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} on:scroll={handleScroll} />

<header class="header">
	<div class="container">
		<nav class="nav">
			<a href="/" class="logo">
				<Camera size={24} />
				<span>PhotoComp</span>
			</a>

			<div class="nav-links" class:open={mobileMenuOpen}>
				<a href="/" on:click={closeMobileMenu}>Home</a>
				<a href="/competitions" on:click={closeMobileMenu}>Wettbewerbe</a>
				{#if $isAuthenticated}
					<a href="/submit" on:click={closeMobileMenu}>Einreichen</a>
				{/if}
			</div>

			<div class="nav-actions">
				{#if $isAuthenticated && $currentUser}
					<div class="user-menu-wrapper">
						<button
							class="user-menu-btn"
							on:click|stopPropagation={toggleUserMenu}
						>
							<img
								src={$currentUser.avatar}
								alt={$currentUser.name}
							/>
						</button>

						{#if userMenuOpen}
							<div class="user-dropdown">
								{#if $currentUser?.role === "admin"}
									<a href="/admin" class="dropdown-item">
										<Settings size={18} />
										<span>Admin</span>
									</a>
								{/if}
								{#if $currentUser?.role === "jury" || $currentUser?.role === "admin"}
									<a href="/jury" class="dropdown-item">
										<Award size={18} />
										<span>Jury</span>
									</a>
								{/if}
								<a
									href="/profile/{$currentUser.username}"
									class="dropdown-item"
								>
									<User size={18} />
									<span>Mein Profil</span>
								</a>
								<button
									class="dropdown-item"
									on:click={handleLogout}
								>
									<LogOut size={18} />
									<span>Abmelden</span>
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<button class="btn btn-primary" on:click={handleLogin}>
						Anmelden
					</button>
				{/if}

				<button class="mobile-menu-btn" on:click={toggleMobileMenu}>
					{#if mobileMenuOpen}
						<X size={24} />
					{:else}
						<Menu size={24} />
					{/if}
				</button>
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
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md) 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-decoration: none;
		letter-spacing: -0.02em;
	}

	.logo :global(svg) {
		color: var(--color-primary);
	}

	.nav-links {
		display: flex;
		gap: var(--spacing-xl);
		align-items: center;
	}

	.nav-links a {
		color: var(--color-text-secondary);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
		font-size: 0.9375rem;
	}

	.nav-links a:hover {
		color: var(--color-primary);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	/* User Menu */
	.user-menu-wrapper {
		position: relative;
	}

	.user-menu-btn {
		all: unset;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		overflow: hidden;
		border: 2px solid var(--color-border);
		transition: border-color 0.2s;
	}

	.user-menu-btn:hover {
		border-color: var(--color-primary);
	}

	.user-menu-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.user-dropdown {
		position: absolute;
		top: calc(100% + var(--spacing-sm));
		right: 0;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		min-width: 180px;
		overflow: hidden;
		z-index: 100;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		width: 100%;
		padding: var(--spacing-md);
		border: none;
		background: white;
		color: var(--color-text-primary);
		font-size: 0.9375rem;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: background 0.2s;
		text-decoration: none;
		text-align: left;
	}

	.dropdown-item:hover {
		background: var(--color-surface);
	}

	.dropdown-item:not(:last-child) {
		border-bottom: 1px solid var(--color-border);
	}

	.dropdown-item :global(svg) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	/* Mobile Menu Button */
	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		color: var(--color-text-primary);
		cursor: pointer;
		padding: var(--spacing-xs);
	}

	.mobile-menu-btn :global(svg) {
		pointer-events: none;
	}

	/* Mobile Styles */
	@media (max-width: 768px) {
		.mobile-menu-btn {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.nav-links {
			position: fixed;
			top: 60px;
			left: 0;
			right: 0;
			background: white;
			flex-direction: column;
			padding: var(--spacing-lg);
			gap: var(--spacing-md);
			border-bottom: 1px solid var(--color-border);
			box-shadow: var(--shadow-lg);
			transform: translateY(-100%);
			opacity: 0;
			pointer-events: none;
			transition: all 0.3s ease;
		}

		.nav-links.open {
			transform: translateY(0);
			opacity: 1;
			pointer-events: auto;
		}

		.nav-links a {
			width: 100%;
			padding: var(--spacing-sm) 0;
			text-align: center;
		}

		.user-dropdown {
			right: auto;
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>
