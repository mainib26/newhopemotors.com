<script lang="ts">
	interface Props {
		vehicle: {
			year: number;
			make: string;
			model: string;
			trim: string | null;
			mileage: number;
			engine: string | null;
			transmission: string | null;
			drivetrain: string | null;
			exteriorColor: string | null;
			interiorColor: string | null;
			condition: string;
			vin: string;
			stockNumber: string | null;
		};
	}

	let { vehicle }: Props = $props();

	function formatMileage(m: number): string {
		return new Intl.NumberFormat('en-US').format(m);
	}

	const specs = $derived(
		[
			{ label: 'Year', value: String(vehicle.year) },
			{ label: 'Make', value: vehicle.make },
			{ label: 'Model', value: vehicle.model },
			{ label: 'Trim', value: vehicle.trim },
			{ label: 'Mileage', value: `${formatMileage(vehicle.mileage)} mi` },
			{ label: 'Engine', value: vehicle.engine },
			{ label: 'Transmission', value: vehicle.transmission },
			{ label: 'Drivetrain', value: vehicle.drivetrain },
			{ label: 'Exterior', value: vehicle.exteriorColor },
			{ label: 'Interior', value: vehicle.interiorColor },
			{ label: 'Condition', value: vehicle.condition },
			{ label: 'Stock #', value: vehicle.stockNumber },
			{ label: 'VIN', value: vehicle.vin }
		].filter((s) => s.value)
	);
</script>

<div>
	<h2 class="text-lg font-heading font-bold text-text mb-4">Vehicle Specifications</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
		{#each specs as spec}
			<div class="flex justify-between py-2.5 border-b border-border">
				<span class="text-sm text-text-muted">{spec.label}</span>
				<span class="text-sm font-medium text-text">{spec.value}</span>
			</div>
		{/each}
	</div>
</div>
