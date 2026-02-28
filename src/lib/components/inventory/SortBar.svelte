<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	interface Props {
		total: number;
		onToggleFilters?: () => void;
	}

	let { total, onToggleFilters }: Props = $props();

	let currentSort = $derived($page.url.searchParams.get('sort') || 'newest');

	function handleSort(e: Event) {
		const params = new URLSearchParams($page.url.searchParams);
		const value = (e.target as HTMLSelectElement).value;
		if (value === 'newest') {
			params.delete('sort');
		} else {
			params.set('sort', value);
		}
		goto(`/inventory?${params.toString()}`);
	}
</script>

<div class="flex items-center justify-between gap-4 py-4">
	<div class="flex items-center gap-3">
		<!-- Mobile filter toggle -->
		{#if onToggleFilters}
			<button
				onclick={onToggleFilters}
				class="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-[var(--radius-button)] hover:bg-cream transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
				</svg>
				Filters
			</button>
		{/if}
		<p class="text-sm text-text-muted">
			<span class="font-semibold text-text">{total}</span> vehicles found
		</p>
	</div>

	<div class="flex items-center gap-2">
		<label for="sort-select" class="text-sm text-text-muted hidden sm:block">Sort by:</label>
		<select
			id="sort-select"
			value={currentSort}
			onchange={handleSort}
			class="px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
		>
			<option value="newest">Newest</option>
			<option value="price-low">Price: Low to High</option>
			<option value="price-high">Price: High to Low</option>
			<option value="mileage-low">Mileage: Low to High</option>
			<option value="mileage-high">Mileage: High to Low</option>
		</select>
	</div>
</div>
