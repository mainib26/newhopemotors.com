<script lang="ts">
	import PhotoGallery from '$lib/components/vehicle/PhotoGallery.svelte';
	import VehicleSpecs from '$lib/components/vehicle/VehicleSpecs.svelte';
	import VehicleFeatures from '$lib/components/vehicle/VehicleFeatures.svelte';
	import PriceBlock from '$lib/components/vehicle/PriceBlock.svelte';
	import HistoryBadge from '$lib/components/vehicle/HistoryBadge.svelte';
	import SimilarVehicles from '$lib/components/vehicle/SimilarVehicles.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { data } = $props();
	const v = $derived(data.vehicle);
	const vehicleName = $derived(`${v.year} ${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}`);

	let testDriveOpen = $state(false);
	let offerOpen = $state(false);
	let questionOpen = $state(false);

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
	}

	// Schema.org JSON-LD
	const schemaOrg = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Vehicle',
		name: vehicleName,
		manufacturer: { '@type': 'Organization', name: v.make },
		model: v.model,
		vehicleModelDate: String(v.year),
		mileageFromOdometer: {
			'@type': 'QuantitativeValue',
			value: v.mileage,
			unitCode: 'SMI'
		},
		color: v.exteriorColor,
		vehicleInteriorColor: v.interiorColor,
		vehicleEngine: v.engine ? { '@type': 'EngineSpecification', name: v.engine } : undefined,
		vehicleTransmission: v.transmission,
		driveWheelConfiguration: v.drivetrain,
		vehicleIdentificationNumber: v.vin,
		offers: {
			'@type': 'Offer',
			price: v.internetPrice || v.price,
			priceCurrency: 'USD',
			availability: v.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
			seller: {
				'@type': 'AutoDealer',
				name: 'New Hope Motors',
				telephone: '(972) 767-8434',
				address: {
					'@type': 'PostalAddress',
					streetAddress: '3343 FM 1827',
					addressLocality: 'McKinney',
					addressRegion: 'TX',
					postalCode: '75071'
				}
			}
		},
		image: v.photos.map((p: any) => p.url)
	}));
</script>

<svelte:head>
	<title>{vehicleName} for Sale — New Hope Motors, McKinney TX</title>
	<meta name="description" content="{vehicleName} with {new Intl.NumberFormat('en-US').format(v.mileage)} miles for {formatPrice(v.internetPrice || v.price)}. {v.description?.slice(0, 120) || 'Quality pre-owned vehicle at New Hope Motors in McKinney, TX.'}" />
	<meta property="og:title" content="{vehicleName} — {formatPrice(v.internetPrice || v.price)}" />
	<meta property="og:description" content="{v.description?.slice(0, 200) || vehicleName}" />
	{#if v.photos[0]}
		<meta property="og:image" content={v.photos[0].url} />
	{/if}
	{@html `<script type="application/ld+json">${schemaOrg}</script>`}
</svelte:head>

<div class="bg-background">
	<!-- Breadcrumbs -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
		<nav class="flex text-sm text-text-muted" aria-label="Breadcrumb">
			<a href="/" class="hover:text-primary">Home</a>
			<span class="mx-2">/</span>
			<a href="/inventory" class="hover:text-primary">Inventory</a>
			<span class="mx-2">/</span>
			<span class="text-text font-medium">{vehicleName}</span>
		</nav>
	</div>

	<!-- Sold Banner -->
	{#if v.status === 'SOLD'}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
			<div class="bg-red-50 border border-red-200 rounded-[var(--radius-card)] p-4 text-center">
				<p class="text-red-700 font-semibold">This vehicle has been sold</p>
				<p class="text-sm text-red-600 mt-1">Check out our similar vehicles below, or <a href="/inventory" class="underline">browse our full inventory</a>.</p>
			</div>
		</div>
	{/if}

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
		<div class="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
			<!-- Left Column -->
			<div class="space-y-8">
				<PhotoGallery photos={v.photos} {vehicleName} />

				<div>
					<div class="flex items-start justify-between gap-4">
						<div>
							<h1 class="text-2xl sm:text-3xl font-heading font-bold text-text">{vehicleName}</h1>
							<div class="mt-2 flex flex-wrap gap-2">
								<Badge variant="primary">{v.bodyType}</Badge>
								<Badge variant="accent">{v.condition}</Badge>
								{#if v.stockNumber}
									<Badge>Stock #{v.stockNumber}</Badge>
								{/if}
							</div>
						</div>
					</div>
				</div>

				{#if v.description}
					<div>
						<h2 class="text-lg font-heading font-bold text-text mb-3">Description</h2>
						<p class="text-text-muted leading-relaxed">{v.description}</p>
					</div>
				{/if}

				<VehicleSpecs vehicle={v} />
				<VehicleFeatures features={typeof v.features === 'string' ? JSON.parse(v.features) : v.features} />
				<HistoryBadge carfaxUrl={v.carfaxUrl} autoCheckUrl={v.autoCheckUrl} />
			</div>

			<!-- Right Column — Price & CTAs (sticky on desktop) -->
			<div class="mt-8 lg:mt-0">
				<div class="lg:sticky lg:top-24">
					<PriceBlock
						price={v.price}
						internetPrice={v.internetPrice}
						onScheduleTestDrive={() => (testDriveOpen = true)}
						onMakeOffer={() => (offerOpen = true)}
						onAskQuestion={() => (questionOpen = true)}
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Similar Vehicles -->
	<SimilarVehicles vehicles={data.similar} />
</div>

<!-- Modals (placeholders — will be wired to lead forms in Task 7) -->
<Modal bind:open={testDriveOpen} onclose={() => (testDriveOpen = false)} title="Schedule a Test Drive">
	<p class="text-text-muted mb-4">Interested in the {vehicleName}? Fill out the form below and we'll get back to you right away.</p>
	<p class="text-sm text-text-light">Lead form coming in Task 7...</p>
</Modal>

<Modal bind:open={offerOpen} onclose={() => (offerOpen = false)} title="Make an Offer">
	<p class="text-text-muted mb-4">Tell us what you'd like to pay for the {vehicleName}.</p>
	<p class="text-sm text-text-light">Lead form coming in Task 7...</p>
</Modal>

<Modal bind:open={questionOpen} onclose={() => (questionOpen = false)} title="Ask a Question">
	<p class="text-text-muted mb-4">Have a question about the {vehicleName}? We're happy to help.</p>
	<p class="text-sm text-text-light">Lead form coming in Task 7...</p>
</Modal>
