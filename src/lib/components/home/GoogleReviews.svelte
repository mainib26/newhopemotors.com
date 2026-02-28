<script lang="ts">
	const reviews = [
		{
			name: 'Michael R.',
			rating: 5,
			text: 'Daniel and his team made buying a car a pleasure. No pressure, no games — just honest people helping you find the right vehicle. Best dealership experience I\'ve ever had.',
			date: 'October 2025'
		},
		{
			name: 'Jessica T.',
			rating: 5,
			text: 'We drove from Frisco specifically because of the reviews, and they did not disappoint. The truck was exactly as described and the price was fair. Highly recommend!',
			date: 'November 2025'
		},
		{
			name: 'Robert & Maria L.',
			rating: 5,
			text: 'New Hope Motors went above and beyond to help us get financing. Daniel personally followed up multiple times to make sure we were happy. That\'s rare these days.',
			date: 'December 2025'
		}
	];
</script>

<section class="py-16 bg-cream">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="text-center mb-12">
			<div class="flex items-center justify-center gap-1 mb-3">
				{#each Array(5) as _}
					<svg class="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
				{/each}
			</div>
			<h2 class="text-2xl sm:text-3xl font-heading font-bold text-text">4.9 Stars on Google</h2>
			<p class="mt-2 text-text-muted">45 reviews from real customers</p>
		</div>

		<!-- Review Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each reviews as review}
				<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6">
					<div class="flex items-center gap-1 mb-3">
						{#each Array(review.rating) as _}
							<svg class="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
						{/each}
					</div>
					<p class="text-sm text-text leading-relaxed mb-4">"{review.text}"</p>
					<div class="flex items-center justify-between text-sm">
						<span class="font-semibold text-text">{review.name}</span>
						<span class="text-text-light">{review.date}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
