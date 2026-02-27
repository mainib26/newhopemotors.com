<script lang="ts">
	import VehicleCard from '$lib/components/inventory/VehicleCard.svelte';

	interface Props {
		vehicles: {
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
		}[];
	}

	let { vehicles }: Props = $props();
</script>

{#if vehicles.length > 0}
	<section class="py-12 bg-cream">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 class="text-2xl font-heading font-bold text-text mb-6">Similar Vehicles</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{#each vehicles as vehicle (vehicle.id)}
					<VehicleCard {vehicle} />
				{/each}
			</div>
		</div>
	</section>
{/if}
