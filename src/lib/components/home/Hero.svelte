<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	let searchQuery = $state('');

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/inventory?q=${encodeURIComponent(searchQuery.trim())}`;
		} else {
			window.location.href = '/inventory';
		}
	}
</script>

<section class="relative bg-primary overflow-hidden">
	<!-- Background image -->
	<div class="absolute inset-0">
		<img
			src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1920&q=80"
			alt=""
			class="w-full h-full object-cover opacity-25"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/80"></div>
	</div>

	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
		<div class="max-w-3xl mx-auto text-center">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">
				Giving New Hope<br />
				<span class="text-accent">in Every Drive</span>
			</h1>
			<p class="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
				Quality pre-owned vehicles with transparent pricing and personal service.
				Serving McKinney, Frisco, Allen, and Plano.
			</p>

			<!-- Search Bar -->
			<form onsubmit={handleSearch} class="mt-10 max-w-xl mx-auto">
				<div class="flex bg-white rounded-[var(--radius-card)] shadow-lg overflow-hidden">
					<div class="flex-1 flex items-center px-4">
						<svg class="w-5 h-5 text-text-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search by make, model, or keyword..."
							class="w-full px-3 py-4 text-text bg-transparent border-none focus:outline-none text-sm sm:text-base"
						/>
					</div>
					<button
						type="submit"
						class="px-6 sm:px-8 bg-accent hover:bg-accent-dark text-white font-semibold text-sm transition-colors"
					>
						Search
					</button>
				</div>
			</form>

			<!-- Quick Stats -->
			<div class="mt-10 flex flex-wrap justify-center gap-8 text-white/70 text-sm">
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
					<span>4.9 Stars on Google</span>
				</div>
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>100% Inspected</span>
				</div>
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Fair, Transparent Pricing</span>
				</div>
			</div>
		</div>
	</div>
</section>
