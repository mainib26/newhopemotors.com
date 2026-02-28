<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	const hours = [
		{ day: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
		{ day: 'Saturday', time: '9:00 AM – 6:00 PM' },
		{ day: 'Sunday', time: 'Closed' }
	];
</script>

<section class="py-16 bg-primary text-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
			<!-- Info -->
			<div>
				<h2 class="text-2xl sm:text-3xl font-heading font-bold mb-6">Visit Us Today</h2>

				<div class="space-y-6">
					<!-- Address -->
					<div class="flex gap-4">
						<div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
							<svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<div>
							<p class="font-semibold">3343 FM 1827</p>
							<p class="text-white/70">McKinney, TX 75071</p>
						</div>
					</div>

					<!-- Phone -->
					<div class="flex gap-4">
						<div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
							<svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
							</svg>
						</div>
						<div>
							<a href="tel:9727678434" class="font-semibold hover:text-accent transition-colors">(972) 767-8434</a>
							<p class="text-white/70">Call or text anytime</p>
						</div>
					</div>

					<!-- Hours -->
					<div class="flex gap-4">
						<div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
							<svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="space-y-1">
							{#each hours as h}
								<div class="flex justify-between gap-8 text-sm">
									<span class="text-white/70">{h.day}</span>
									<span class="font-medium">{h.time}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div class="mt-8 flex flex-wrap gap-4">
					<Button href="/contact" variant="accent">Get Directions</Button>
					<Button href="tel:9727678434" variant="secondary">Call Now</Button>
				</div>
			</div>

			<!-- Map -->
			<div class="rounded-[var(--radius-card)] overflow-hidden h-80 lg:h-auto min-h-[320px]">
				<iframe
					title="New Hope Motors location"
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3340.5!2d-96.6!3d33.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDEyJzAwLjAiTiA5NsKwMzYnMDAuMCJX!5e0!3m2!1sen!2sus!4v1"
					width="100%"
					height="100%"
					style="border:0;"
					allowfullscreen
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
				></iframe>
			</div>
		</div>
	</div>
</section>
