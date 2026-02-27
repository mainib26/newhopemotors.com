<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		makes: string[];
		bodyTypes: string[];
		open?: boolean;
		onclose?: () => void;
	}

	let { makes, bodyTypes, open = true, onclose }: Props = $props();

	let selectedMake = $derived($page.url.searchParams.get('make') || '');
	let selectedBodyType = $derived($page.url.searchParams.get('bodyType') || '');
	let minPrice = $derived($page.url.searchParams.get('minPrice') || '');
	let maxPrice = $derived($page.url.searchParams.get('maxPrice') || '');
	let minYear = $derived($page.url.searchParams.get('minYear') || '');
	let maxYear = $derived($page.url.searchParams.get('maxYear') || '');
	let maxMileage = $derived($page.url.searchParams.get('maxMileage') || '');

	function applyFilters() {
		const params = new URLSearchParams();

		if (selectedMake) params.set('make', selectedMake);
		if (selectedBodyType) params.set('bodyType', selectedBodyType);
		if (minPrice) params.set('minPrice', minPrice);
		if (maxPrice) params.set('maxPrice', maxPrice);
		if (minYear) params.set('minYear', minYear);
		if (maxYear) params.set('maxYear', maxYear);
		if (maxMileage) params.set('maxMileage', maxMileage);

		// Preserve sort and search
		const sort = $page.url.searchParams.get('sort');
		const q = $page.url.searchParams.get('q');
		if (sort) params.set('sort', sort);
		if (q) params.set('q', q);

		goto(`/inventory?${params.toString()}`, { keepFocus: true });
		onclose?.();
	}

	function clearFilters() {
		goto('/inventory');
		onclose?.();
	}

	const hasFilters = $derived(
		selectedMake || selectedBodyType || minPrice || maxPrice || minYear || maxYear || maxMileage
	);

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
</script>

{#if open}
	<form onsubmit={(e) => { e.preventDefault(); applyFilters(); }} class="space-y-6">
		<div class="flex items-center justify-between">
			<h3 class="font-heading font-bold text-text">Filters</h3>
			{#if hasFilters}
				<button type="button" onclick={clearFilters} class="text-sm text-primary hover:underline">
					Clear all
				</button>
			{/if}
		</div>

		<!-- Make -->
		<div class="space-y-2">
			<label for="filter-make" class="block text-sm font-medium text-text">Make</label>
			<select
				id="filter-make"
				value={selectedMake}
				onchange={(e) => {
					const params = new URLSearchParams($page.url.searchParams);
					const val = (e.target as HTMLSelectElement).value;
					if (val) params.set('make', val);
					else params.delete('make');
					goto(`/inventory?${params.toString()}`);
				}}
				class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-input)] bg-surface"
			>
				<option value="">All Makes</option>
				{#each makes as make}
					<option value={make}>{make}</option>
				{/each}
			</select>
		</div>

		<!-- Body Type -->
		<div class="space-y-2">
			<label for="filter-body" class="block text-sm font-medium text-text">Body Type</label>
			<select
				id="filter-body"
				value={selectedBodyType}
				onchange={(e) => {
					const params = new URLSearchParams($page.url.searchParams);
					const val = (e.target as HTMLSelectElement).value;
					if (val) params.set('bodyType', val);
					else params.delete('bodyType');
					goto(`/inventory?${params.toString()}`);
				}}
				class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-input)] bg-surface"
			>
				<option value="">All Types</option>
				{#each bodyTypes as bt}
					<option value={bt}>{bt}</option>
				{/each}
			</select>
		</div>

		<!-- Price Range -->
		<div class="space-y-2">
			<label class="block text-sm font-medium text-text">Price Range</label>
			<div class="grid grid-cols-2 gap-2">
				<input
					type="number"
					placeholder="Min"
					value={minPrice}
					onchange={(e) => {
						const params = new URLSearchParams($page.url.searchParams);
						const val = (e.target as HTMLInputElement).value;
						if (val) params.set('minPrice', val);
						else params.delete('minPrice');
						goto(`/inventory?${params.toString()}`);
					}}
					class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-input)] bg-surface"
				/>
				<input
					type="number"
					placeholder="Max"
					value={maxPrice}
					onchange={(e) => {
						const params = new URLSearchParams($page.url.searchParams);
						const val = (e.target as HTMLInputElement).value;
						if (val) params.set('maxPrice', val);
						else params.delete('maxPrice');
						goto(`/inventory?${params.toString()}`);
					}}
					class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-input)] bg-surface"
				/>
			</div>
		</div>

		<!-- Year Range -->
		<div class="space-y-2">
			<label class="block text-sm font-medium text-text">Year</label>
			<div class="grid grid-cols-2 gap-2">
				<select
					value={minYear}
					onchange={(e) => {
						const params = new URLSearchParams($page.url.searchParams);
						const val = (e.target as HTMLSelectElement).value;
						if (val) params.set('minYear', val);
						else params.delete('minYear');
						goto(`/inventory?${params.toString()}`);
					}}
					class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-input)] bg-surface"
				>
					<option value="">Min Year</option>
					{#each years as y}
						<option value={y}>{y}</option>
					{/each}
				</select>
				<select
					value={maxYear}
					onchange={(e) => {
						const params = new URLSearchParams($page.url.searchParams);
						const val = (e.target as HTMLSelectElement).value;
						if (val) params.set('maxYear', val);
						else params.delete('maxYear');
						goto(`/inventory?${params.toString()}`);
					}}
					class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-input)] bg-surface"
				>
					<option value="">Max Year</option>
					{#each years as y}
						<option value={y}>{y}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Max Mileage -->
		<div class="space-y-2">
			<label for="filter-mileage" class="block text-sm font-medium text-text">Max Mileage</label>
			<select
				id="filter-mileage"
				value={maxMileage}
				onchange={(e) => {
					const params = new URLSearchParams($page.url.searchParams);
					const val = (e.target as HTMLSelectElement).value;
					if (val) params.set('maxMileage', val);
					else params.delete('maxMileage');
					goto(`/inventory?${params.toString()}`);
				}}
				class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-input)] bg-surface"
			>
				<option value="">Any Mileage</option>
				<option value="25000">Under 25,000</option>
				<option value="50000">Under 50,000</option>
				<option value="75000">Under 75,000</option>
				<option value="100000">Under 100,000</option>
			</select>
		</div>
	</form>
{/if}
