<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const selectClass = 'w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none';

	interface Props {
		vehicle?: any;
		errors?: Record<string, string>;
		submitting?: boolean;
	}

	let { vehicle = {}, errors = {}, submitting = false }: Props = $props();

	let vin = $state(vehicle.vin ?? '');
	let decoding = $state(false);

	async function decodeVin() {
		if (vin.length !== 17) return;
		decoding = true;
		try {
			const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
			const data = await res.json();
			const get = (id: number) => data.Results?.find((r: any) => r.VariableId === id)?.Value || '';

			const yearInput = document.querySelector<HTMLInputElement>('input[name="year"]');
			const makeInput = document.querySelector<HTMLInputElement>('input[name="make"]');
			const modelInput = document.querySelector<HTMLInputElement>('input[name="model"]');
			const trimInput = document.querySelector<HTMLInputElement>('input[name="trim"]');
			const engineInput = document.querySelector<HTMLInputElement>('input[name="engine"]');

			if (yearInput) yearInput.value = get(29);
			if (makeInput) makeInput.value = get(26);
			if (modelInput) modelInput.value = get(28);
			if (trimInput) trimInput.value = get(38);
			if (engineInput) {
				const cylinders = get(9);
				const displacement = get(11);
				engineInput.value = displacement ? `${displacement}L ${cylinders}-Cyl` : '';
			}
		} catch {
			// VIN decode failed silently
		} finally {
			decoding = false;
		}
	}

	const bodyTypes = [
		{ value: '', label: 'Select body type' },
		{ value: 'SEDAN', label: 'Sedan' },
		{ value: 'SUV', label: 'SUV' },
		{ value: 'TRUCK', label: 'Truck' },
		{ value: 'WAGON', label: 'Wagon' },
		{ value: 'COUPE', label: 'Coupe' },
		{ value: 'CONVERTIBLE', label: 'Convertible' },
		{ value: 'VAN', label: 'Van' },
		{ value: 'HATCHBACK', label: 'Hatchback' }
	];

	const conditions = [
		{ value: '', label: 'Select condition' },
		{ value: 'EXCELLENT', label: 'Excellent' },
		{ value: 'GOOD', label: 'Good' },
		{ value: 'FAIR', label: 'Fair' }
	];

	const statuses = [
		{ value: 'ACTIVE', label: 'Active' },
		{ value: 'INCOMING', label: 'Incoming' },
		{ value: 'IN_RECON', label: 'In Recon' },
		{ value: 'SOLD', label: 'Sold' },
		{ value: 'DELETED', label: 'Deleted' }
	];

	const transmissions = [
		{ value: '', label: 'Select transmission' },
		{ value: 'AUTOMATIC', label: 'Automatic' },
		{ value: 'MANUAL', label: 'Manual' },
		{ value: 'CVT', label: 'CVT' }
	];

	const drivetrains = [
		{ value: '', label: 'Select drivetrain' },
		{ value: 'FWD', label: 'FWD' },
		{ value: 'RWD', label: 'RWD' },
		{ value: 'AWD', label: 'AWD' },
		{ value: '4WD', label: '4WD' }
	];
</script>

<div class="space-y-6">
	{#if errors._form}
		<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">{errors._form}</div>
	{/if}

	<!-- VIN -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
		<h3 class="font-heading font-bold text-text">Identification</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="flex gap-2">
				<div class="flex-1">
					<Input label="VIN" name="vin" value={vin} oninput={(e: Event) => vin = (e.target as HTMLInputElement).value} placeholder="17-character VIN" maxlength={17} error={errors.vin} />
				</div>
				<div class="self-end">
					<Button type="button" variant="secondary" onclick={decodeVin} disabled={vin.length !== 17 || decoding}>
						{decoding ? 'Decoding...' : 'Decode'}
					</Button>
				</div>
			</div>
			<Input label="Stock Number" name="stockNumber" value={vehicle.stockNumber ?? ''} placeholder="e.g. NH2401" error={errors.stockNumber} />
		</div>
	</div>

	<!-- Vehicle Info -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
		<h3 class="font-heading font-bold text-text">Vehicle Info</h3>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<Input label="Year" name="year" type="number" value={vehicle.year ?? ''} placeholder="2024" required error={errors.year} />
			<Input label="Make" name="make" value={vehicle.make ?? ''} placeholder="Toyota" required error={errors.make} />
			<Input label="Model" name="model" value={vehicle.model ?? ''} placeholder="Camry" required error={errors.model} />
			<Input label="Trim" name="trim" value={vehicle.trim ?? ''} placeholder="SE" />
		</div>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="space-y-1.5">
				<label for="bodyType" class="block text-sm font-medium text-text">Body Type</label>
				<select id="bodyType" name="bodyType" class={selectClass} value={vehicle.bodyType ?? ''}>
					{#each bodyTypes as opt}<option value={opt.value}>{opt.label}</option>{/each}
				</select>
			</div>
			<div class="space-y-1.5">
				<label for="condition" class="block text-sm font-medium text-text">Condition</label>
				<select id="condition" name="condition" class={selectClass} value={vehicle.condition ?? ''}>
					{#each conditions as opt}<option value={opt.value}>{opt.label}</option>{/each}
				</select>
			</div>
			<div class="space-y-1.5">
				<label for="status" class="block text-sm font-medium text-text">Status</label>
				<select id="status" name="status" class={selectClass} value={vehicle.status ?? 'ACTIVE'}>
					{#each statuses as opt}<option value={opt.value}>{opt.label}</option>{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Specs -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
		<h3 class="font-heading font-bold text-text">Specifications</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<Input label="Mileage" name="mileage" type="number" value={vehicle.mileage ?? ''} placeholder="45000" />
			<Input label="Engine" name="engine" value={vehicle.engine ?? ''} placeholder="2.5L 4-Cyl" />
			<div class="space-y-1.5">
				<label for="transmission" class="block text-sm font-medium text-text">Transmission</label>
				<select id="transmission" name="transmission" class={selectClass} value={vehicle.transmission ?? ''}>
					{#each transmissions as opt}<option value={opt.value}>{opt.label}</option>{/each}
				</select>
			</div>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="space-y-1.5">
				<label for="drivetrain" class="block text-sm font-medium text-text">Drivetrain</label>
				<select id="drivetrain" name="drivetrain" class={selectClass} value={vehicle.drivetrain ?? ''}>
					{#each drivetrains as opt}<option value={opt.value}>{opt.label}</option>{/each}
				</select>
			</div>
			<Input label="Exterior Color" name="exteriorColor" value={vehicle.exteriorColor ?? ''} placeholder="Silver" />
			<Input label="Interior Color" name="interiorColor" value={vehicle.interiorColor ?? ''} placeholder="Black" />
		</div>
	</div>

	<!-- Pricing -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
		<h3 class="font-heading font-bold text-text">Pricing</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Input label="Price" name="price" type="number" value={vehicle.price ?? ''} placeholder="25995" required error={errors.price} />
			<Input label="Internet Price" name="internetPrice" type="number" value={vehicle.internetPrice ?? ''} placeholder="24995" />
		</div>
	</div>

	<!-- Description & Features -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
		<h3 class="font-heading font-bold text-text">Description & Features</h3>
		<div class="space-y-1.5">
			<label for="description" class="block text-sm font-medium text-text">Description</label>
			<textarea
				id="description"
				name="description"
				rows="4"
				class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary resize-none"
				placeholder="Vehicle description..."
			>{vehicle.description ?? ''}</textarea>
		</div>
		<div class="space-y-1.5">
			<label for="features" class="block text-sm font-medium text-text">Features <span class="text-text-light">(one per line)</span></label>
			<textarea
				id="features"
				name="features"
				rows="4"
				class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary resize-none"
				placeholder="Backup Camera&#10;Bluetooth&#10;Apple CarPlay"
			>{(vehicle.features ?? []).join('\n')}</textarea>
		</div>
	</div>

	<!-- Submit -->
	<div class="flex justify-end gap-3">
		<Button href="/admin/vehicles" variant="secondary">Cancel</Button>
		<Button type="submit" disabled={submitting}>
			{submitting ? 'Saving...' : vehicle.id ? 'Update Vehicle' : 'Create Vehicle'}
		</Button>
	</div>
</div>
