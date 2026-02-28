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
				When I opened New Hope Motors, I wanted a place where you could talk about cars the same way you'd talk across
				a kitchen table—plain and respectful. No high-pressure routines and no surprises on the paperwork. Just a real
				conversation about what you need and whether we have something that fits.
			</p>
			<p class="text-text-muted leading-relaxed mb-4">
				We pick up vehicles through trades and a few trusted sources, go through them carefully, and price them right at
				market. If something doesn’t feel solid, it doesn’t make the cut. It’s not complicated: treat folks well, be
				clear about what you’re selling, and trust they’ll come back because it felt right the first time.
			</p>
			<p class="text-text-muted leading-relaxed mb-6">
				We’re here in McKinney, working with families from Frisco, Allen, Plano, Prosper—really anywhere in Collin
				County. Whether you’re buying your first car or trading up for more space, you’ll get a calm, honest experience.
				Come by, have a look, ask questions. If it isn’t the right fit, that’s fine too.
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
