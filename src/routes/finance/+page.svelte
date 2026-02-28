<script lang="ts">
	import PaymentCalculator from '$lib/components/home/PaymentCalculator.svelte';
	import PreQualForm from '$lib/components/finance/PreQualForm.svelte';
	import FAQAccordion from '$lib/components/finance/FAQAccordion.svelte';
</script>

<svelte:head>
	<title>Financing — New Hope Motors, McKinney TX</title>
	<meta name="description" content="Get pre-approved for auto financing at New Hope Motors. We work with all credit profiles. Use our payment calculator and apply online today." />
</svelte:head>

<div class="bg-background">
	<!-- Payment Calculator -->
	<PaymentCalculator />

	<!-- Pre-Qualification Form -->
	<section class="py-16 bg-cream">
		<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-8">
				<h2 class="text-2xl sm:text-3xl font-heading font-bold text-text">Get Pre-Qualified</h2>
				<p class="mt-2 text-text-muted">Quick and easy — no impact on your credit score.</p>
			</div>
			<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8">
				<PreQualForm />
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section class="py-16 bg-background">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 class="text-2xl sm:text-3xl font-heading font-bold text-text text-center mb-8">
				Financing FAQ
			</h2>
			<FAQAccordion />
		</div>
	</section>

	<!-- CTA -->
	<section class="py-12 bg-primary text-white text-center">
		<div class="max-w-2xl mx-auto px-4">
			<h2 class="text-2xl font-heading font-bold mb-3">Questions? We're Here to Help</h2>
			<p class="text-white/70 mb-6">Our financing team is ready to find the right solution for you.</p>
			<a
				href="tel:9727678434"
				class="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-[var(--radius-button)] transition-colors"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
				</svg>
				Call (972) 767-8434
			</a>
			<p class="mt-4 text-xs text-white/50">
				*All financing subject to credit approval. Terms and rates vary by lender and applicant creditworthiness.
			</p>
		</div>
	</section>
</div>
