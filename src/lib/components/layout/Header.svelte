<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';

	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/inventory', label: 'Inventory' },
		{ href: '/finance', label: 'Finance' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16 lg:h-20">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2 shrink-0" onclick={closeMobileMenu}>
				<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<span class="text-white font-bold text-sm">NH</span>
				</div>
				<div class="hidden sm:block">
					<span class="font-heading text-lg font-bold text-primary">New Hope</span>
					<span class="font-heading text-lg font-bold text-accent"> Motors</span>
				</div>
			</a>

			<!-- Desktop Nav -->
			<nav class="hidden lg:flex items-center gap-8">
				{#each navLinks as link}
					<a
						href={link.href}
						class="text-sm font-medium transition-colors {$page.url.pathname.startsWith(link.href)
							? 'text-primary'
							: 'text-text-muted hover:text-text'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<!-- Phone CTA -->
			<div class="hidden lg:flex items-center gap-4">
				<a href="tel:9727678434" class="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-primary transition-colors">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
					</svg>
					(972) 767-8434
				</a>
				<Button href="/inventory" size="sm">View Inventory</Button>
			</div>

			<!-- Mobile Menu Button -->
			<button
				class="lg:hidden p-2 rounded-[var(--radius-button)] hover:bg-cream transition-colors"
				onclick={toggleMobileMenu}
				aria-label="Toggle menu"
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="lg:hidden border-t border-border bg-surface">
			<nav class="px-4 py-4 space-y-1">
				{#each navLinks as link}
					<a
						href={link.href}
						class="block px-4 py-3 rounded-[var(--radius-button)] text-sm font-medium transition-colors {$page.url.pathname.startsWith(link.href)
							? 'bg-primary/10 text-primary'
							: 'text-text-muted hover:bg-cream hover:text-text'}"
						onclick={closeMobileMenu}
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<div class="px-4 pb-4 space-y-3">
				<a
					href="tel:9727678434"
					class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-[var(--radius-button)]"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
					</svg>
					Call (972) 767-8434
				</a>
				<Button href="/inventory" fullWidth>View Inventory</Button>
			</div>
		</div>
	{/if}
</header>
