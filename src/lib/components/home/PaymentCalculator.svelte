<script lang="ts">
	const creditTiers = [
		{ label: 'Excellent', range: '750+', rate: 4.99 },
		{ label: 'Good', range: '700–749', rate: 6.49 },
		{ label: 'Fair', range: '650–699', rate: 9.49 },
		{ label: 'Rebuilding', range: 'Under 650', rate: 13.99 }
	];

	let price = $state(30000);
	let downPayment = $state(3000);
	let term = $state(72);
	let selectedTier = $state(1); // default to "Good"

	let rate = $derived(creditTiers[selectedTier].rate);

	let monthly = $derived(() => {
		const principal = price - downPayment;
		if (principal <= 0) return 0;
		const monthlyRate = rate / 100 / 12;
		if (monthlyRate === 0) return principal / term;
		return (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
	});

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
	}
</script>

<section class="py-16 bg-background">
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
		<h2 class="text-2xl sm:text-3xl font-heading font-bold text-text text-center mb-4">
			Estimate Your Payment
		</h2>
		<p class="text-center text-text-muted mb-8">
			Use our calculator to get a quick monthly estimate.
		</p>

		<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<!-- Vehicle Price -->
				<div class="space-y-2">
					<label for="calc-price" class="block text-sm font-medium text-text">Vehicle Price</label>
					<input
						id="calc-price"
						type="range"
						bind:value={price}
						min="5000"
						max="80000"
						step="500"
						class="w-full accent-primary"
					/>
					<div class="text-right text-sm font-semibold text-primary">{formatCurrency(price)}</div>
				</div>

				<!-- Down Payment -->
				<div class="space-y-2">
					<label for="calc-down" class="block text-sm font-medium text-text">Down Payment</label>
					<input
						id="calc-down"
						type="range"
						bind:value={downPayment}
						min="0"
						max={price * 0.5}
						step="500"
						class="w-full accent-primary"
					/>
					<div class="text-right text-sm font-semibold text-primary">{formatCurrency(downPayment)}</div>
				</div>

				<!-- Loan Term -->
				<div class="space-y-2">
					<label for="calc-term" class="block text-sm font-medium text-text">Loan Term</label>
					<select
						id="calc-term"
						bind:value={term}
						class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value={36}>36 months</option>
						<option value={48}>48 months</option>
						<option value={60}>60 months</option>
						<option value={72}>72 months</option>
						<option value={84}>84 months</option>
					</select>
				</div>

				<!-- Credit Score -->
				<div class="space-y-2">
					<label class="block text-sm font-medium text-text">Credit Score</label>
					<div class="grid grid-cols-2 gap-2">
						{#each creditTiers as tier, i}
							<button
								type="button"
								onclick={() => selectedTier = i}
								class="px-3 py-2 text-xs rounded-[var(--radius-button)] border transition-colors text-left {selectedTier === i ? 'bg-primary text-white border-primary' : 'bg-surface text-text border-border hover:border-primary/50'}"
							>
								<span class="font-semibold">{tier.label}</span>
								<span class="block text-[10px] {selectedTier === i ? 'text-white/70' : 'text-text-muted'}">{tier.range} · {tier.rate}% APR</span>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Result -->
			<div class="mt-8 pt-6 border-t border-border text-center">
				<p class="text-sm text-text-muted mb-1">Estimated Monthly Payment</p>
				<p class="text-4xl font-heading font-extrabold text-primary">
					{formatCurrency(monthly())}
					<span class="text-lg font-normal text-text-muted">/mo</span>
				</p>
			</div>
		</div>

		<p class="mt-4 text-xs text-text-light text-center">
			*For illustration purposes only. Does not include tax, title, license, or dealer fees.
			Rates shown are estimates based on credit tier and may vary. Actual terms depend on credit approval. See dealer for details.
		</p>
	</div>
</section>
