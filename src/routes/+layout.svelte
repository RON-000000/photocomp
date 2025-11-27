<script>
	import { onMount } from 'svelte';
	import { initAuth0, isLoading } from '$lib/stores/auth0';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';
	
	onMount(async () => {
		await initAuth0();
	});
</script>

{#if $isLoading}
	<div class="app-loading">
		<span class="loading"></span>
	</div>
{:else}
	<div class="app">
		<Header />
		<main>
			<slot />
		</main>
		<Footer />
	</div>
{/if}

<style>
	.app-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--color-surface);
	}
	
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	
	main {
		flex: 1;
	}
</style>