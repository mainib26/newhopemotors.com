<script lang="ts">
	let price = $state(30000);
	let downPayment = $state(3000);
	let term = $state(72);
	let rate = $state(6.99);

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

				<!-- Interest Rate -->
				<div class="space-y-2">
					<label for="calc-rate" class="block text-sm font-medium text-text">Interest Rate</label>
					<input
						id="calc-rate"
						type="range"
						bind:value={rate}
						min="0"
						max="15"
						step="0.25"
						class="w-full accent-primary"
					/>
					<div class="text-right text-sm font-semibold text-primary">{rate.toFixed(2)}%</div>
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
			Actual terms depend on credit approval. See dealer for details.
		</p>
	</div>
</section>
