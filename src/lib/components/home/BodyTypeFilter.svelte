<script lang="ts">
	const bodyTypes = [
		{
			type: 'SEDAN',
			label: 'Sedans',
			icon: 'M3 12h1l1-3h14l1 3h1a1 1 0 011 1v3h-2a2 2 0 01-4 0H8a2 2 0 01-4 0H2v-3a1 1 0 011-1z'
		},
		{
			type: 'SUV',
			label: 'SUVs',
			icon: 'M3 10h1l2-4h12l2 4h1a1 1 0 011 1v4h-2a2 2 0 01-4 0H8a2 2 0 01-4 0H2v-4a1 1 0 011-1z'
		},
		{
			type: 'TRUCK',
			label: 'Trucks',
			icon: 'M3 12h1l1-3h8V6h5l2 3h1a1 1 0 011 1v3h-2a2 2 0 01-4 0h-2a2 2 0 01-4 0H2v-1z'
		},
		{
			type: 'WAGON',
			label: 'Wagons',
			icon: 'M3 11h1l1.5-3h13l1.5 3h1a1 1 0 011 1v3h-2a2 2 0 01-4 0H8a2 2 0 01-4 0H2v-3a1 1 0 011-1z'
		}
	];
</script>

<section class="py-12 bg-background">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<h2 class="text-center text-2xl font-heading font-bold text-text mb-8">Browse by Type</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each bodyTypes as bt}
				<a
					href="/inventory?bodyType={bt.type}"
					class="group flex flex-col items-center gap-3 p-6 bg-surface border border-border rounded-[var(--radius-card)] hover:border-primary hover:shadow-md transition-all duration-200"
				>
					<div class="w-16 h-16 bg-cream rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
						<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d={bt.icon} />
						</svg>
					</div>
					<span class="font-semibold text-text group-hover:text-primary transition-colors">{bt.label}</span>
				</a>
			{/each}
		</div>
	</div>
</section>
