<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { form } = $props();

	// Wizard state
	let step = $state<1 | 2 | 3>(1);
	let mode = $state<'ai' | 'manual' | null>(null);
	let submitting = $state(false);

	// Step 1: Photos
	let photos = $state<{ file: File; preview: string }[]>([]);
	let dragOver = $state(false);

	// Step 2: Analysis (AI mode)
	let analyzing = $state(false);
	let analysisError = $state('');

	// Form data (populated by AI or manual entry)
	let vin = $state('');
	let year = $state('');
	let make = $state('');
	let model = $state('');
	let trim = $state('');
	let bodyType = $state('');
	let condition = $state('GOOD');
	let status = $state('ACTIVE');
	let mileage = $state('');
	let engine = $state('');
	let transmission = $state('');
	let drivetrain = $state('');
	let exteriorColor = $state('');
	let interiorColor = $state('');
	let price = $state('');
	let internetPrice = $state('');
	let description = $state('');
	let features = $state('');
	let stockNumber = $state('');
	let decoding = $state(false);

	const selectClass = 'w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none';
	const textareaClass = 'w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary resize-none';

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

	// Step labels adapt to mode
	const stepLabels = $derived({
		1: 'Photos',
		2: mode === 'manual' ? 'Identify' : 'Analyze',
		3: mode === 'manual' ? 'Details' : 'Review'
	});

	// --- Photo handling ---
	function handleFiles(fileList: FileList) {
		const newFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
		const total = photos.length + newFiles.length;
		if (total > 20) {
			alert('Maximum 20 photos allowed');
			return;
		}
		for (const file of newFiles) {
			const preview = URL.createObjectURL(file);
			photos = [...photos, { file, preview }];
		}
	}

	function removePhoto(index: number) {
		URL.revokeObjectURL(photos[index].preview);
		photos = photos.filter((_, i) => i !== index);
	}

	function handleDrop(e: DragEvent) {
		dragOver = false;
		if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) handleFiles(input.files);
		input.value = '';
	}

	// --- AI Analysis ---
	async function analyzePhotos() {
		if (photos.length === 0) return;
		mode = 'ai';
		step = 2;
		analyzing = true;
		analysisError = '';

		try {
			const imagesToAnalyze = photos.slice(0, 8);
			const base64Images = await Promise.all(
				imagesToAnalyze.map(p => fileToBase64(p.file))
			);

			const res = await fetch('/api/admin/vehicles/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ images: base64Images })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Analysis failed' }));
				throw new Error(err.message || `Analysis failed (${res.status})`);
			}

			const data = await res.json();

			if (data.vin) vin = data.vin;
			if (data.year) year = String(data.year);
			if (data.make) make = data.make;
			if (data.model) model = data.model;
			if (data.trim) trim = data.trim;
			if (data.bodyType) bodyType = data.bodyType;
			if (data.exteriorColor) exteriorColor = data.exteriorColor;
			if (data.interiorColor) interiorColor = data.interiorColor;
			if (data.mileage) mileage = String(data.mileage);
			if (data.engine) engine = data.engine;
			if (data.transmission) transmission = data.transmission;
			if (data.drivetrain) drivetrain = data.drivetrain;
			if (data.condition) condition = data.condition;
			if (data.description) description = data.description;
			if (data.features && Array.isArray(data.features)) {
				features = data.features.join('\n');
			}

			step = 3;
		} catch (err: any) {
			analysisError = err.message || 'Photo analysis failed. You can continue manually.';
		} finally {
			analyzing = false;
		}
	}

	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	// --- VIN decode (auto-triggers at 17 chars) ---
	let lastDecodedVin = $state('');

	$effect(() => {
		if (vin.length === 17 && vin !== lastDecodedVin) {
			decodeVin();
		}
	});

	async function decodeVin() {
		if (vin.length !== 17 || decoding) return;
		lastDecodedVin = vin;
		decoding = true;
		try {
			const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
			const data = await res.json();
			const get = (id: number) => {
				const val = data.Results?.find((r: any) => r.VariableId === id)?.Value;
				return val && val !== 'Not Applicable' ? val : '';
			};
			if (get(29)) year = get(29);
			if (get(26)) make = get(26);
			if (get(28)) model = get(28);
			if (get(38)) trim = get(38);
			const displacement = get(11);
			const cylinders = get(9);
			if (displacement) engine = `${displacement}L ${cylinders ? cylinders + '-Cyl' : ''}`.trim();
		} catch {
			// VIN decode failed silently
		} finally {
			decoding = false;
		}
	}

	function startManualEntry() {
		mode = 'manual';
		step = 2;
		analyzing = false;
	}

	function continueFromAnalysisError() {
		mode = 'manual';
		// Stay on step 2 but now show manual identify form
		analyzing = false;
		analysisError = '';
	}

	// Validation for step 2 → step 3 transition (manual mode)
	let step2Errors = $state<Record<string, string>>({});

	function proceedToDetails() {
		step2Errors = {};
		if (!year || parseInt(year) < 1900 || parseInt(year) > 2030) step2Errors.year = 'Valid year required';
		if (!make.trim()) step2Errors.make = 'Make is required';
		if (!model.trim()) step2Errors.model = 'Model is required';
		if (Object.keys(step2Errors).length > 0) return;
		step = 3;
	}
</script>

<svelte:head>
	<title>Add Vehicle — Admin</title>
</svelte:head>

<div class="max-w-4xl">
	<!-- Header with step indicator -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-heading font-bold text-text">Add Vehicle</h1>
		<div class="flex items-center gap-2 text-sm text-text-muted">
			{#each [1, 2, 3] as s, i}
				{#if i > 0}
					<span class="w-6 h-px {step > s - 1 ? 'bg-primary' : 'bg-border'}"></span>
				{/if}
				<span class="flex items-center gap-1.5">
					<span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors {step > s ? 'bg-primary text-white' : step === s ? 'bg-primary text-white' : 'bg-border text-text-muted'}">
						{#if step > s}
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
						{:else}
							{s}
						{/if}
					</span>
					<span class="hidden sm:inline {step >= s ? 'text-text font-medium' : ''}">{stepLabels[s as 1 | 2 | 3]}</span>
				</span>
			{/each}
		</div>
	</div>

	<!-- ============================================ -->
	<!-- STEP 1: Upload Photos                        -->
	<!-- ============================================ -->
	{#if step === 1}
		<div class="space-y-6">
			<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6">
				<h3 class="font-heading font-bold text-text mb-1">Upload Vehicle Photos</h3>
				<p class="text-sm text-text-muted mb-5">Upload photos and our AI will automatically identify the vehicle, read the VIN, and fill in the details.</p>

				<!-- Drop zone -->
				<label
					class="block border-2 border-dashed rounded-[var(--radius-card)] p-10 text-center cursor-pointer transition-colors {dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}"
					role="region"
					aria-label="Photo upload area"
					ondragover={(e) => { e.preventDefault(); dragOver = true; }}
					ondragleave={() => dragOver = false}
					ondrop={(e) => { e.preventDefault(); handleDrop(e); }}
				>
					<input type="file" accept="image/*" multiple class="hidden" onchange={handleFileInput} />
					<svg class="mx-auto w-12 h-12 text-text-light mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
					</svg>
					<p class="text-text font-medium">Drag & drop photos here</p>
					<p class="text-sm text-text-muted mt-1">or click to browse — up to 20 photos</p>
					<p class="text-xs text-text-light mt-2">Tip: Include a VIN plate photo for automatic VIN detection</p>
				</label>

				<!-- Thumbnails -->
				{#if photos.length > 0}
					<div class="mt-5 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
						{#each photos as photo, i}
							<div class="relative group aspect-square rounded-lg overflow-hidden bg-cream">
								<img src={photo.preview} alt="Vehicle photo {i + 1}" class="w-full h-full object-cover" />
								<button
									type="button"
									class="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
									onclick={() => removePhoto(i)}
									aria-label="Remove photo"
								>
									<svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
								</button>
								{#if i === 0}
									<span class="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-medium">Primary</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex justify-between">
				<Button href="/admin/vehicles" variant="secondary">Cancel</Button>
				<div class="flex gap-3">
					<Button type="button" variant="ghost" onclick={startManualEntry}>Enter Manually</Button>
					<Button type="button" onclick={analyzePhotos} disabled={photos.length === 0}>
						Analyze Photos ({photos.length})
					</Button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ============================================ -->
	<!-- STEP 2: AI Analyzing  OR  Manual Identify    -->
	<!-- ============================================ -->
	{#if step === 2 && mode === 'ai'}
		<div class="bg-surface border border-border rounded-[var(--radius-card)] p-10 text-center">
			{#if analyzing}
				<div class="flex flex-col items-center gap-4">
					<div class="w-16 h-16 relative">
						<div class="absolute inset-0 border-4 border-border rounded-full"></div>
						<div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					</div>
					<div>
						<h3 class="font-heading font-bold text-text text-lg">Analyzing your photos...</h3>
						<p class="text-sm text-text-muted mt-1">AI is identifying the vehicle, reading the VIN, and detecting features</p>
					</div>
					<div class="flex gap-1.5 mt-4">
						{#each photos.slice(0, 6) as photo, i}
							<div class="w-14 h-14 rounded-lg overflow-hidden opacity-60 animate-pulse" style="animation-delay: {i * 150}ms">
								<img src={photo.preview} alt="" class="w-full h-full object-cover" />
							</div>
						{/each}
						{#if photos.length > 6}
							<div class="w-14 h-14 rounded-lg bg-cream flex items-center justify-center text-xs text-text-muted font-medium">+{photos.length - 6}</div>
						{/if}
					</div>
				</div>
			{:else if analysisError}
				<div class="flex flex-col items-center gap-4">
					<div class="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
						<svg class="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
					</div>
					<div>
						<h3 class="font-heading font-bold text-text text-lg">Analysis couldn't complete</h3>
						<p class="text-sm text-text-muted mt-1">{analysisError}</p>
					</div>
					<div class="flex gap-3 mt-2">
						<Button type="button" variant="secondary" onclick={() => { step = 1; mode = null; }}>Back to Photos</Button>
						<Button type="button" onclick={continueFromAnalysisError}>Continue Manually</Button>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	{#if step === 2 && mode === 'manual'}
		<div class="space-y-6">
			<!-- VIN first — the fastest path -->
			<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6">
				<div class="text-center mb-6">
					<h3 class="font-heading font-bold text-text text-lg">Identify the Vehicle</h3>
					<p class="text-sm text-text-muted mt-1">Enter the VIN to auto-fill, or type the details below.</p>
				</div>

				<!-- VIN decode — prominent -->
				<div class="max-w-lg mx-auto mb-6">
					<div class="flex gap-2">
						<div class="flex-1">
							<Input label="VIN" name="vin" bind:value={vin} placeholder="Enter 17-character VIN" maxlength={17} />
						</div>
						<div class="self-end">
							<Button type="button" onclick={decodeVin} disabled={vin.length !== 17 || decoding}>
								{decoding ? 'Decoding...' : 'Decode VIN'}
							</Button>
						</div>
					</div>
					{#if vin.length > 0 && vin.length < 17}
						<p class="text-xs text-text-light mt-1">{17 - vin.length} more character{17 - vin.length !== 1 ? 's' : ''} needed</p>
					{/if}
				</div>

				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
					<div class="relative flex justify-center"><span class="bg-surface px-3 text-xs text-text-light uppercase tracking-wide">Vehicle Info</span></div>
				</div>

				<!-- Core vehicle fields -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Input label="Year" bind:value={year} type="number" placeholder="2024" required error={step2Errors.year} />
					<Input label="Make" bind:value={make} placeholder="Toyota" required error={step2Errors.make} />
					<Input label="Model" bind:value={model} placeholder="Camry" required error={step2Errors.model} />
					<Input label="Trim" bind:value={trim} placeholder="SE" />
				</div>

				<!-- Body type selector -->
				<div class="mt-5">
					<label class="block text-sm font-medium text-text mb-2">Body Type</label>
					<div class="flex flex-wrap gap-2">
						{#each bodyTypes.slice(1) as bt}
							<button
								type="button"
								class="px-4 py-2 rounded-full border text-sm transition-all {bodyType === bt.value ? 'border-primary bg-primary text-white font-medium' : 'border-border bg-surface hover:border-primary/40 text-text-muted'}"
								onclick={() => bodyType = bt.value}
							>
								{bt.label}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex justify-between">
				<Button type="button" variant="secondary" onclick={() => { step = 1; mode = null; }}>Back</Button>
				<Button type="button" onclick={proceedToDetails}>
					Continue to Details
				</Button>
			</div>
		</div>
	{/if}

	<!-- ============================================ -->
	<!-- STEP 3: Review (AI) / Details (Manual)       -->
	<!-- ============================================ -->
	{#if step === 3}
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={({ formData }) => {
				submitting = true;
				for (const photo of photos) {
					formData.append('photos', photo.file);
				}
				return async ({ update }) => {
					submitting = false;
					await update();
				};
			}}
		>
			<div class="space-y-6">
				{#if form?.errors?._form}
					<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">{form.errors._form}</div>
				{/if}

				<!-- AI Result Banner (AI mode only) -->
				{#if mode === 'ai' && make && model}
					<div class="bg-success/5 border border-success/20 rounded-[var(--radius-card)] p-4 flex items-start gap-3">
						<svg class="w-5 h-5 text-success mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						<div>
							<p class="text-sm font-medium text-text">
								AI identified: {year} {make} {model} {trim}
								{#if vin}<span class="text-text-muted"> — VIN: {vin}</span>{/if}
							</p>
							<p class="text-xs text-text-muted mt-0.5">Review the details below and adjust anything that needs correction.</p>
						</div>
					</div>
				{/if}

				<!-- Photo preview (if photos exist) -->
				{#if photos.length > 0}
					<div class="bg-surface border border-border rounded-[var(--radius-card)] p-4">
						<div class="flex items-center justify-between mb-3">
							<h3 class="font-heading font-bold text-text text-sm">{photos.length} Photo{photos.length !== 1 ? 's' : ''} attached</h3>
							<button type="button" class="text-xs text-primary hover:underline" onclick={() => { step = 1; mode = null; }}>Edit Photos</button>
						</div>
						<div class="flex gap-2 overflow-x-auto pb-1">
							{#each photos as photo, i}
								<div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 {i === 0 ? 'ring-2 ring-primary' : ''}">
									<img src={photo.preview} alt="Photo {i + 1}" class="w-full h-full object-cover" />
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Identification (AI mode: editable; manual mode: summary from step 2) -->
				{#if mode === 'ai'}
					<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
						<h3 class="font-heading font-bold text-text">Identification</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="flex gap-2">
								<div class="flex-1">
									<Input label="VIN" name="vin" bind:value={vin} placeholder="17-character VIN" maxlength={17} error={form?.errors?.vin} />
								</div>
								<div class="self-end">
									<Button type="button" variant="secondary" onclick={decodeVin} disabled={vin.length !== 17 || decoding}>
										{decoding ? 'Decoding...' : 'Decode'}
									</Button>
								</div>
							</div>
							<Input label="Stock Number" name="stockNumber" bind:value={stockNumber} placeholder="e.g. NH2401" error={form?.errors?.stockNumber} />
						</div>
					</div>
				{:else}
					<!-- Manual mode: compact summary of step 2 data + stock number -->
					<input type="hidden" name="vin" value={vin} />
					<input type="hidden" name="bodyType" value={bodyType} />
					<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="font-heading font-bold text-text text-sm">
									{year} {make} {model}{trim ? ` ${trim}` : ''}
									{#if bodyType}
										<span class="ml-2 text-xs font-normal text-text-muted bg-cream px-2 py-0.5 rounded-full">{bodyTypes.find(b => b.value === bodyType)?.label}</span>
									{/if}
								</h3>
								{#if vin}
									<p class="text-xs text-text-muted mt-0.5">VIN: {vin}</p>
								{/if}
							</div>
							<button type="button" class="text-xs text-primary hover:underline" onclick={() => step = 2}>Edit</button>
						</div>
						<div class="border-t border-border pt-4">
							<Input label="Stock Number" name="stockNumber" bind:value={stockNumber} placeholder="e.g. NH2401" error={form?.errors?.stockNumber} />
						</div>
					</div>
				{/if}

				<!-- Vehicle Info (AI mode: full edit; manual mode: already entered in step 2) -->
				{#if mode === 'ai'}
					<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
						<h3 class="font-heading font-bold text-text">Vehicle Info</h3>
						<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Input label="Year" name="year" type="number" bind:value={year} placeholder="2024" required error={form?.errors?.year} />
							<Input label="Make" name="make" bind:value={make} placeholder="Toyota" required error={form?.errors?.make} />
							<Input label="Model" name="model" bind:value={model} placeholder="Camry" required error={form?.errors?.model} />
							<Input label="Trim" name="trim" bind:value={trim} placeholder="SE" />
						</div>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="space-y-1.5">
								<label for="bodyType" class="block text-sm font-medium text-text">Body Type</label>
								<select id="bodyType" name="bodyType" class={selectClass} bind:value={bodyType}>
									{#each bodyTypes as opt}<option value={opt.value}>{opt.label}</option>{/each}
								</select>
							</div>
							<div class="space-y-1.5">
								<label for="condition" class="block text-sm font-medium text-text">Condition</label>
								<select id="condition" name="condition" class={selectClass} bind:value={condition}>
									{#each conditions as opt}<option value={opt.value}>{opt.label}</option>{/each}
								</select>
							</div>
							<div class="space-y-1.5">
								<label for="status" class="block text-sm font-medium text-text">Status</label>
								<select id="status" name="status" class={selectClass} bind:value={status}>
									{#each statuses as opt}<option value={opt.value}>{opt.label}</option>{/each}
								</select>
							</div>
						</div>
					</div>
				{:else}
					<!-- Manual mode: hidden fields for year/make/model/trim (from step 2) + condition/status -->
					<input type="hidden" name="year" value={year} />
					<input type="hidden" name="make" value={make} />
					<input type="hidden" name="model" value={model} />
					<input type="hidden" name="trim" value={trim} />
					<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
						<h3 class="font-heading font-bold text-text">Condition & Status</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label for="condition" class="block text-sm font-medium text-text">Condition</label>
								<select id="condition" name="condition" class={selectClass} bind:value={condition}>
									{#each conditions as opt}<option value={opt.value}>{opt.label}</option>{/each}
								</select>
							</div>
							<div class="space-y-1.5">
								<label for="status" class="block text-sm font-medium text-text">Status</label>
								<select id="status" name="status" class={selectClass} bind:value={status}>
									{#each statuses as opt}<option value={opt.value}>{opt.label}</option>{/each}
								</select>
							</div>
						</div>
					</div>
				{/if}

				<!-- Specs -->
				<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
					<h3 class="font-heading font-bold text-text">Specifications</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Input label="Mileage" name="mileage" type="number" bind:value={mileage} placeholder="45000" />
						<Input label="Engine" name="engine" bind:value={engine} placeholder="2.5L 4-Cyl" />
						<div class="space-y-1.5">
							<label for="transmission" class="block text-sm font-medium text-text">Transmission</label>
							<select id="transmission" name="transmission" class={selectClass} bind:value={transmission}>
								{#each transmissions as opt}<option value={opt.value}>{opt.label}</option>{/each}
							</select>
						</div>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="space-y-1.5">
							<label for="drivetrain" class="block text-sm font-medium text-text">Drivetrain</label>
							<select id="drivetrain" name="drivetrain" class={selectClass} bind:value={drivetrain}>
								{#each drivetrains as opt}<option value={opt.value}>{opt.label}</option>{/each}
							</select>
						</div>
						<Input label="Exterior Color" name="exteriorColor" bind:value={exteriorColor} placeholder="Silver" />
						<Input label="Interior Color" name="interiorColor" bind:value={interiorColor} placeholder="Black" />
					</div>
				</div>

				<!-- Pricing -->
				<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
					<h3 class="font-heading font-bold text-text">Pricing</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input label="Price" name="price" type="number" bind:value={price} placeholder="25995" required error={form?.errors?.price} />
						<Input label="Internet Price" name="internetPrice" type="number" bind:value={internetPrice} placeholder="24995" />
					</div>
				</div>

				<!-- Description & Features -->
				<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
					<h3 class="font-heading font-bold text-text">Description & Features</h3>
					<div class="space-y-1.5">
						<label for="description" class="block text-sm font-medium text-text">Description</label>
						<textarea id="description" name="description" rows="4" class={textareaClass} placeholder="Vehicle description..." bind:value={description}></textarea>
					</div>
					<div class="space-y-1.5">
						<label for="features" class="block text-sm font-medium text-text">Features <span class="text-text-light">(one per line)</span></label>
						<textarea id="features" name="features" rows="4" class={textareaClass} placeholder="Backup Camera&#10;Bluetooth&#10;Apple CarPlay" bind:value={features}></textarea>
					</div>
				</div>

				<!-- Submit -->
				<div class="flex justify-between">
					<Button type="button" variant="secondary" onclick={() => { step = mode === 'manual' ? 2 : 1; }}>
						Back
					</Button>
					<Button type="submit" disabled={submitting}>
						{submitting ? 'Creating Vehicle...' : 'Create Vehicle'}
					</Button>
				</div>
			</div>
		</form>
	{/if}
</div>
