<script lang="ts">
	const faqs = [
		{
			q: 'What credit score do I need to get approved?',
			a: 'We work with lenders who serve all credit profiles — from excellent to challenged credit. Even if you\'ve been turned down elsewhere, we may be able to help. Apply online or come talk to us.'
		},
		{
			q: 'How much should I put down?',
			a: 'While a larger down payment can lower your monthly payment and interest rate, we have options starting from $500 down depending on your situation. We\'ll work with you to find the best structure.'
		},
		{
			q: 'Can I get pre-approved before visiting?',
			a: 'Yes! Fill out our online pre-qualification form above. It\'s a soft inquiry that won\'t affect your credit score. We\'ll let you know your estimated terms so you can shop with confidence.'
		},
		{
			q: 'What documents do I need to bring?',
			a: 'Valid driver\'s license, proof of income (2 recent pay stubs), proof of residence (utility bill or bank statement), and proof of insurance. If you\'re trading in a vehicle, bring the title.'
		},
		{
			q: 'Do you offer warranties?',
			a: 'We offer optional extended warranty packages through reputable providers. Many of our vehicles also have remaining manufacturer warranty. Ask us about coverage options for any vehicle on our lot.'
		},
		{
			q: 'How long does financing take?',
			a: 'Most of our customers drive home the same day! Once we have your information, approval typically takes 30-60 minutes. We\'ll handle all the paperwork so you can focus on enjoying your new ride.'
		}
	];

	let openIndex = $state<number | null>(null);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<div class="space-y-3">
	{#each faqs as faq, i}
		<div class="border border-border rounded-[var(--radius-card)] overflow-hidden">
			<button
				onclick={() => toggle(i)}
				class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-cream/50 transition-colors"
			>
				<span class="font-medium text-text text-sm pr-4">{faq.q}</span>
				<svg
					class="w-5 h-5 text-text-muted shrink-0 transition-transform {openIndex === i ? 'rotate-180' : ''}"
					fill="none" stroke="currentColor" viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if openIndex === i}
				<div class="px-5 pb-4 text-sm text-text-muted leading-relaxed">
					{faq.a}
				</div>
			{/if}
		</div>
	{/each}
</div>
