<script lang="ts">
	import { autoDealer } from '$lib/seo/schema';
	import Hero from '$lib/components/home/Hero.svelte';
	import BodyTypeFilter from '$lib/components/home/BodyTypeFilter.svelte';
	import FeaturedVehicles from '$lib/components/home/FeaturedVehicles.svelte';
	import TrustPillars from '$lib/components/home/TrustPillars.svelte';
	import PaymentCalculator from '$lib/components/home/PaymentCalculator.svelte';
	import GoogleReviews from '$lib/components/home/GoogleReviews.svelte';
	import MeetDaniel from '$lib/components/home/MeetDaniel.svelte';
	import ContactMap from '$lib/components/home/ContactMap.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>New Hope Motors — Quality Used Cars in McKinney, TX</title>
	<meta name="description" content="New Hope Motors is McKinney's trusted independent used car dealership. Browse our inspected inventory of sedans, SUVs, trucks, and more. Fair pricing, personal service, 4.9-star Google rating." />
	{@html `<script type="application/ld+json">${JSON.stringify(autoDealer())}</script>`}
</svelte:head>

<Hero />
<BodyTypeFilter />
<FeaturedVehicles vehicles={data.featuredVehicles} />
<TrustPillars />
<PaymentCalculator />
<GoogleReviews />
<MeetDaniel />
<ContactMap />
