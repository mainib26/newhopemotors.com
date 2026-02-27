<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Sidebar from '$lib/components/admin/Sidebar.svelte';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';

	let { children, data }: { children: Snippet; data: any } = $props();

	let sidebarCollapsed = $state(false);

	const isLoginPage = $derived(page.url.pathname === '/admin/login');
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="flex h-screen bg-background overflow-hidden">
		<Sidebar collapsed={sidebarCollapsed} />
		<div class="flex-1 flex flex-col overflow-hidden">
			<AdminHeader user={data.user} onToggleSidebar={() => sidebarCollapsed = !sidebarCollapsed} />
			<main class="flex-1 overflow-y-auto p-6">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
