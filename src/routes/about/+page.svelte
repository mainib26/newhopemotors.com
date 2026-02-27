<script lang="ts">
	import GoogleReviews from '$lib/components/home/GoogleReviews.svelte';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<svelte:head>
	<title>About Us — New Hope Motors, McKinney TX</title>
	<meta name="description" content="Meet Daniel and the New Hope Motors team. We're an independent used car dealership in McKinney, TX built on honest deals, personal service, and community trust." />
</svelte:head>

<div class="bg-background">
	<!-- Daniel's Story -->
	<section class="py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<div class="aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-cream">
					<img
						src="https://placehold.co/800x600/2D5F3E/FAFAF7?text=Daniel"
						alt="Daniel, owner of New Hope Motors"
						class="w-full h-full object-cover"
					/>
				</div>
				<div>
					<h2 class="text-2xl sm:text-3xl font-heading font-bold text-text mb-6">Meet Daniel</h2>
					<div class="space-y-4 text-text-muted leading-relaxed">
						<p>
							When I started New Hope Motors, I had one simple goal: treat every customer
							the way I'd want to be treated. No pushy sales tactics. No hidden fees.
							Just honest conversations about what you need and how we can help.
						</p>
						<p>
							After years of watching friends and family get burned by dealerships that
							cared more about the sale than the customer, I decided to build something
							different. A place where you can trust the person selling you the car
							because they'd put their own family in it.
						</p>
						<p>
							I personally inspect every vehicle on our lot. I know the history, the
							condition, and the fair price for each one. My reputation is on the line
							with every sale — and that's exactly how I like it.
						</p>
						<p>
							We're located right here in McKinney, serving families across Collin County —
							from Frisco and Allen to Plano and Prosper. Whether you're a first-time buyer
							or upgrading for a growing family, I'd love to help you find the right vehicle.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Values -->
	<section class="py-16 bg-cream">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 class="text-2xl sm:text-3xl font-heading font-bold text-text text-center mb-12">
				Why New Hope Motors?
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
				{#each [
					{ title: 'Honest Pricing', desc: 'Market-based pricing with no hidden fees. The price you see is the price you pay, plus tax, title, and license.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
					{ title: 'Quality Inspected', desc: 'Every vehicle passes our multi-point inspection. We don\'t sell anything we wouldn\'t drive ourselves or put our family in.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
					{ title: 'Personal Service', desc: 'You\'re not a number here. Daniel and his team take the time to understand what you need and find the right fit for your life.', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
					{ title: 'Community Roots', desc: 'We live and work right here in McKinney. Our success depends on your satisfaction and your referrals to friends and family.', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }
				] as value}
					<div class="text-center">
						<div class="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
							<svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={value.icon} />
							</svg>
						</div>
						<h3 class="font-heading font-bold text-text mb-2">{value.title}</h3>
						<p class="text-sm text-text-muted leading-relaxed">{value.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Google Reviews -->
	<GoogleReviews />

	<!-- CTA -->
	<section class="py-12 bg-background">
		<div class="max-w-2xl mx-auto px-4 text-center">
			<h2 class="text-2xl font-heading font-bold text-text mb-3">Ready to Find Your Next Vehicle?</h2>
			<p class="text-text-muted mb-6">Browse our inventory or give us a call. We'd love to help.</p>
			<div class="flex flex-wrap justify-center gap-4">
				<Button href="/inventory" size="lg">Browse Inventory</Button>
				<Button href="/contact" variant="secondary" size="lg">Contact Us</Button>
			</div>
		</div>
	</section>
</div>
