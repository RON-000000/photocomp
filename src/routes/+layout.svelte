<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { autoLogin } from '$lib/stores/auth';
	
	onMount(async () => {
		await autoLogin();
	});
</script>

<div class="app">
	<Header />
	
	<main>
		<slot />
	</main>
	
	<Footer />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	main {
		flex: 1;
	}
</style>