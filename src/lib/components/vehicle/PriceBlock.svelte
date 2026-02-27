<script lang="ts">
	interface Props {
		price: number;
		internetPrice: number | null;
		onScheduleTestDrive: () => void;
		onMakeOffer: () => void;
		onAskQuestion: () => void;
	}

	let { price, internetPrice, onScheduleTestDrive, onMakeOffer, onAskQuestion }: Props = $props();

	let showCalculator = $state(false);
	let downPayment = $state(Math.round((internetPrice || price) * 0.1));
	let term = $state(72);
	let rate = $state(6.99);

	const displayPrice = $derived(internetPrice || price);

	let monthly = $derived(() => {
		const principal = displayPrice - downPayment;
		if (principal <= 0) return 0;
		const monthlyRate = rate / 100 / 12;
		if (monthlyRate === 0) return principal / term;
		return (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
	});

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
	}
</script>

<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6 space-y-4">
	<!-- Price -->
	<div>
		{#if internetPrice && internetPrice < price}
			<p class="text-sm text-text-light line-through">{formatCurrency(price)}</p>
			<p class="text-3xl font-heading font-extrabold text-primary">{formatCurrency(internetPrice)}</p>
			<p class="text-xs text-accent font-medium">Internet Price — Save {formatCurrency(price - internetPrice)}</p>
		{:else}
			<p class="text-3xl font-heading font-extrabold text-primary">{formatCurrency(price)}</p>
		{/if}
	</div>

	<!-- Monthly Estimate -->
	<div class="bg-cream rounded-[var(--radius-button)] p-4">
		<button
			onclick={() => (showCalculator = !showCalculator)}
			class="w-full flex items-center justify-between"
		>
			<div>
				<p class="text-sm text-text-muted">Estimated Monthly</p>
				<p class="text-xl font-bold text-text">{formatCurrency(monthly())}<span class="text-sm font-normal text-text-muted">/mo</span></p>
			</div>
			<svg class="w-5 h-5 text-text-muted transition-transform {showCalculator ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if showCalculator}
			<div class="mt-4 space-y-3 pt-3 border-t border-border">
				<div>
					<label class="text-xs text-text-muted">Down Payment</label>
					<input type="range" bind:value={downPayment} min="0" max={displayPrice * 0.5} step="500" class="w-full accent-primary" />
					<p class="text-right text-xs font-medium">{formatCurrency(downPayment)}</p>
				</div>
				<div>
					<label class="text-xs text-text-muted">Term</label>
					<select bind:value={term} class="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface">
						<option value={36}>36 months</option>
						<option value={48}>48 months</option>
						<option value={60}>60 months</option>
						<option value={72}>72 months</option>
						<option value={84}>84 months</option>
					</select>
				</div>
				<div>
					<label class="text-xs text-text-muted">APR: {rate}%</label>
					<input type="range" bind:value={rate} min="0" max="15" step="0.25" class="w-full accent-primary" />
				</div>
			</div>
		{/if}
	</div>

	<!-- CTAs -->
	<div class="space-y-2">
		<button
			onclick={onScheduleTestDrive}
			class="w-full px-5 py-3 bg-primary text-white font-semibold rounded-[var(--radius-button)] hover:bg-primary-dark transition-colors"
		>
			Schedule Test Drive
		</button>
		<button
			onclick={onMakeOffer}
			class="w-full px-5 py-3 bg-accent text-white font-semibold rounded-[var(--radius-button)] hover:bg-accent-dark transition-colors"
		>
			Make an Offer
		</button>
		<button
			onclick={onAskQuestion}
			class="w-full px-5 py-3 bg-surface text-text font-semibold border border-border rounded-[var(--radius-button)] hover:bg-cream transition-colors"
		>
			Ask a Question
		</button>
	</div>

	<!-- Phone -->
	<div class="text-center">
		<p class="text-sm text-text-muted">Or call us directly</p>
		<a href="tel:9727678434" class="text-lg font-bold text-primary hover:underline">(972) 767-8434</a>
	</div>

	<p class="text-xs text-text-light">
		*Payment estimate based on {term} months, {rate}% APR. For illustration only. Does not include tax, title, license, or fees.
	</p>
</div>
