<script lang="ts">
	import FilterSidebar from '$lib/components/inventory/FilterSidebar.svelte';
	import VehicleCard from '$lib/components/inventory/VehicleCard.svelte';
	import SortBar from '$lib/components/inventory/SortBar.svelte';
	import Pagination from '$lib/components/inventory/Pagination.svelte';

	let { data } = $props();

	let mobileFiltersOpen = $state(false);
</script>

<svelte:head>
	<title>Used Cars for Sale in McKinney, TX — New Hope Motors Inventory</title>
	<meta name="description" content="Browse our inventory of quality used cars, SUVs, trucks, and wagons in McKinney, TX. Fair pricing, 100% inspected, financing available. New Hope Motors." />
</svelte:head>

<div class="bg-background min-h-screen">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
		<div class="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
			<!-- Desktop Sidebar -->
			<aside class="hidden lg:block">
				<div class="sticky top-24 bg-surface border border-border rounded-[var(--radius-card)] p-5">
					<FilterSidebar makes={data.makes} bodyTypes={data.bodyTypes} />
				</div>
			</aside>

			<!-- Mobile Filter Drawer -->
			{#if mobileFiltersOpen}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fixed inset-0 z-50 lg:hidden"
					onkeydown={(e) => e.key === 'Escape' && (mobileFiltersOpen = false)}
				>
					<div class="absolute inset-0 bg-black/50" onclick={() => (mobileFiltersOpen = false)}></div>
					<div class="absolute inset-y-0 left-0 w-80 max-w-full bg-surface p-5 overflow-y-auto shadow-xl">
						<div class="flex items-center justify-between mb-4">
							<h2 class="font-heading font-bold text-lg">Filters</h2>
							<button onclick={() => (mobileFiltersOpen = false)} class="p-1 hover:bg-cream rounded-full">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<FilterSidebar
							makes={data.makes}
							bodyTypes={data.bodyTypes}
							onclose={() => (mobileFiltersOpen = false)}
						/>
					</div>
				</div>
			{/if}

			<!-- Main Content -->
			<div>
				<SortBar total={data.total} onToggleFilters={() => (mobileFiltersOpen = true)} />

				{#if data.vehicles.length === 0}
					<div class="text-center py-16">
						<svg class="w-16 h-16 mx-auto text-text-light mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<h2 class="text-xl font-heading font-bold text-text mb-2">No vehicles found</h2>
						<p class="text-text-muted mb-6">Try adjusting your filters or search terms.</p>
						<a href="/inventory" class="text-primary font-semibold hover:underline">Clear all filters</a>
					</div>
				{:else}
					<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
						{#each data.vehicles as vehicle (vehicle.id)}
							<VehicleCard {vehicle} />
						{/each}
					</div>
				{/if}

				<Pagination currentPage={data.page} totalPages={data.totalPages} />

				<p class="text-xs text-text-light text-center pb-8">
					*Payment estimates based on 72 months, 6.99% APR, 10% down. For illustration only.
					Prices exclude tax, title, license &amp; dealer doc fee ($150).
				</p>
			</div>
		</div>
	</div>
</div>
