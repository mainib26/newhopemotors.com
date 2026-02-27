<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';

	interface Props {
		vehicle: {
			id: string;
			year: number;
			make: string;
			model: string;
			trim: string | null;
			price: number;
			internetPrice: number | null;
			mileage: number;
			bodyType: string;
			slug: string;
			exteriorColor: string | null;
			photos: { url: string; alt: string | null }[];
		};
	}

	let { vehicle }: Props = $props();

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
	}

	function formatMileage(mileage: number): string {
		return new Intl.NumberFormat('en-US').format(mileage);
	}

	function estimateMonthly(price: number): string {
		const rate = 0.0699 / 12;
		const months = 72;
		const principal = price * 0.9;
		const monthly = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(monthly);
	}
</script>

<a
	href="/vehicle/{vehicle.slug}"
	class="group bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
>
	<div class="relative aspect-[4/3] bg-cream overflow-hidden">
		<img
			src={vehicle.photos[0]?.url || 'https://placehold.co/800x600/e5e2da/6b7280?text=No+Photo'}
			alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			loading="lazy"
		/>
		<div class="absolute top-3 left-3">
			<Badge variant="primary">{vehicle.bodyType}</Badge>
		</div>
	</div>

	<div class="p-4 flex-1 flex flex-col">
		<h3 class="font-heading font-bold text-text group-hover:text-primary transition-colors">
			{vehicle.year} {vehicle.make} {vehicle.model}
			{#if vehicle.trim}
				<span class="font-normal text-text-muted"> {vehicle.trim}</span>
			{/if}
		</h3>

		{#if vehicle.exteriorColor}
			<p class="text-xs text-text-light mt-1">{vehicle.exteriorColor}</p>
		{/if}

		<div class="mt-auto pt-3">
			<div class="flex items-baseline gap-2">
				<span class="text-xl font-bold text-primary">{formatPrice(vehicle.internetPrice || vehicle.price)}</span>
				{#if vehicle.internetPrice && vehicle.internetPrice < vehicle.price}
					<span class="text-sm text-text-light line-through">{formatPrice(vehicle.price)}</span>
				{/if}
			</div>

			<div class="mt-2 flex items-center justify-between text-sm text-text-muted">
				<span>{formatMileage(vehicle.mileage)} mi</span>
				<span>Est. {estimateMonthly(vehicle.internetPrice || vehicle.price)}/mo*</span>
			</div>
		</div>
	</div>
</a>
