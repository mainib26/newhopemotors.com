<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
</script>

<section class="py-16 bg-background">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<!-- Photo -->
			<div class="relative">
				<div class="aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-cream">
					<img
						src="https://placehold.co/800x600/2D5F3E/FAFAF7?text=Meet+Daniel"
						alt="Daniel, owner of New Hope Motors"
						class="w-full h-full object-cover"
						loading="lazy"
					/>
				</div>
				<!-- Accent decoration -->
				<div class="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-[var(--radius-card)] -z-10"></div>
			</div>

			<!-- Content -->
			<div>
				<h2 class="text-2xl sm:text-3xl font-heading font-bold text-text mb-4">
					Meet Daniel
				</h2>
				<p class="text-text-muted leading-relaxed mb-4">
					When I started New Hope Motors, I had one simple goal: treat every customer
					the way I'd want to be treated. No pushy sales tactics. No hidden fees.
					Just honest conversations about what you need and how we can help.
				</p>
				<p class="text-text-muted leading-relaxed mb-4">
					As an independent dealer here in McKinney, I personally inspect every
					vehicle on our lot. I know the history, the condition, and the fair price
					for each one. My reputation is on the line with every sale — and that's
					exactly how I like it.
				</p>
				<p class="text-text-muted leading-relaxed mb-6">
					Whether you're a first-time buyer or upgrading for your growing family,
					I'm here to help you find the right vehicle at the right price.
					Give me a call — I'd love to chat.
				</p>
				<div class="flex flex-wrap gap-4">
					<Button href="/about">Our Story</Button>
					<Button href="tel:9727678434" variant="secondary">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
						</svg>
						Call Daniel
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>
