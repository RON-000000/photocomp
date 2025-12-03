<script>
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores/auth0';
	import { Users, Trophy, Image, Activity } from 'lucide-svelte';
	
	let stats = null;
	let users = [];
	let loading = true;
	
	onMount(async () => {
		await loadData();
	});
	
	async function loadData() {
		try {
			// Load stats
			const statsRes = await fetch('/api/admin/stats');
			if (statsRes.ok) {
				stats = await statsRes.json();
			}
			
			// Load users
			const usersRes = await fetch('/api/admin/users');
			if (usersRes.ok) {
				users = await usersRes.json();
			}
		} catch (error) {
			console.error('Error loading admin data:', error);
		} finally {
			loading = false;
		}
	}
	
	async function updateRole(userId, newRole) {
		if (!confirm(`Rolle zu "${newRole}" ändern?`)) return;
		
		try {
			const response = await fetch(`/api/admin/users/${userId}/role`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: newRole })
			});
			
			if (response.ok) {
				alert('Rolle erfolgreich aktualisiert!');
				await loadData();
			} else {
				alert('Fehler beim Aktualisieren der Rolle');
			}
		} catch (error) {
			console.error('Error updating role:', error);
			alert('Fehler beim Aktualisieren der Rolle');
		}
	}
</script>

<div class="admin-page">
	<div class="container">
		<header class="page-header">
			<h1>Admin Dashboard</h1>
			<p>Willkommen zurück, {$currentUser?.name}!</p>
		</header>
		
		{#if loading}
			<div class="loading-state">
				<span class="loading"></span>
			</div>
		{:else if stats}
			<!-- Stats Grid -->
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">
						<Users size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-value">{stats.totalUsers}</div>
						<div class="stat-label">Benutzer</div>
					</div>
				</div>
				
				<div class="stat-card">
					<div class="stat-icon">
						<Trophy size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-value">{stats.totalCompetitions}</div>
						<div class="stat-label">Wettbewerbe</div>
					</div>
				</div>
				
				<div class="stat-card">
					<div class="stat-icon">
						<Image size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-value">{stats.totalSubmissions}</div>
						<div class="stat-label">Submissions</div>
					</div>
				</div>
				
				<div class="stat-card">
					<div class="stat-icon">
						<Activity size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-value">{stats.activeCompetitions}</div>
						<div class="stat-label">Aktive Wettbewerbe</div>
					</div>
				</div>
			</div>
			
			<!-- Actions -->
			<div class="actions-section">
				<h2>Aktionen</h2>
				<div class="action-buttons">
					<a href="/admin/competitions/create" class="btn btn-primary">
						<Trophy size={20} />
						<span>Wettbewerb erstellen</span>
					</a>
				</div>
			</div>
			
			<!-- User Management -->
			<div class="users-section">
				<h2>Benutzer-Verwaltung</h2>
				<div class="users-table-wrapper">
					<table class="users-table">
						<thead>
							<tr>
								<th>Benutzer</th>
								<th>Email</th>
								<th>Rolle</th>
								<th>Mitglied seit</th>
								<th>Aktionen</th>
							</tr>
						</thead>
						<tbody>
							{#each users as user}
								<tr>
									<td>
										<div class="user-cell">
											<img src={user.avatar} alt={user.name} class="user-avatar" />
											<div>
												<div class="user-name">{user.name}</div>
												<div class="user-username">@{user.username}</div>
											</div>
										</div>
									</td>
									<td>{user.email}</td>
									<td>
										<span class="role-badge role-{user.role || 'user'}">
											{user.role || 'user'}
										</span>
									</td>
									<td>{new Date(user.createdAt).toLocaleDateString('de-CH')}</td>
									<td>
										<select 
											class="role-select"
											value={user.role || 'user'}
											on:change={(e) => updateRole(user._id, e.target.value)}
										>
											<option value="user">User</option>
											<option value="jury">Jury</option>
											<option value="admin">Admin</option>
										</select>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-page {
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
	
	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
	}
	
	.stat-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}
	
	.stat-icon {
		width: 48px;
		height: 48px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary);
	}
	
	.stat-content {
		flex: 1;
	}
	
	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		margin-bottom: var(--spacing-xs);
	}
	
	.stat-label {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}
	
	/* Actions */
	.actions-section {
		margin-bottom: var(--spacing-2xl);
	}
	
	.actions-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 var(--spacing-lg) 0;
	}
	
	.action-buttons {
		display: flex;
		gap: var(--spacing-md);
	}
	
	/* Users Table */
	.users-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 var(--spacing-lg) 0;
	}
	
	.users-table-wrapper {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
	
	.users-table {
		width: 100%;
		border-collapse: collapse;
	}
	
	.users-table thead {
		background: var(--color-surface);
	}
	
	.users-table th {
		padding: var(--spacing-md);
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		border-bottom: 1px solid var(--color-border);
	}
	
	.users-table td {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}
	
	.users-table tbody tr:last-child td {
		border-bottom: none;
	}
	
	.user-cell {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}
	
	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}
	
	.user-name {
		font-weight: 500;
		color: var(--color-text-primary);
	}
	
	.user-username {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
	
	.role-badge {
		display: inline-block;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.role-user {
		background: #e0e7ff;
		color: #3730a3;
	}
	
	.role-jury {
		background: #fef3c7;
		color: #92400e;
	}
	
	.role-admin {
		background: #fee2e2;
		color: #991b1b;
	}
	
	.role-select {
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		cursor: pointer;
	}
	
	/* Loading State */
	.loading-state {
		display: flex;
		justify-content: center;
		padding: var(--spacing-4xl);
	}
	
	/* Mobile */
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
		
		.users-table-wrapper {
			overflow-x: auto;
		}
		
		.users-table {
			min-width: 600px;
		}
	}
</style>