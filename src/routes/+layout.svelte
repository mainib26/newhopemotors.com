<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import ChatWidget from '$lib/components/chat/ChatWidget.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// Don't show public layout on admin routes
	let isAdmin = $derived($page.url.pathname.startsWith('/admin'));
</script>

{#if isAdmin}
	{@render children()}
{:else}
	<div class="flex flex-col min-h-screen">
		<Header />
		<main class="flex-1">
			{@render children()}
		</main>
		<Footer />
		<ChatWidget />
		<CookieConsent />
	</div>
{/if}
