<script lang="ts">
	const currentYear = new Date().getFullYear();

	const inventoryLinks = [
		{ href: '/inventory?bodyType=SUV', label: 'SUVs' },
		{ href: '/inventory?bodyType=TRUCK', label: 'Trucks' },
		{ href: '/inventory?bodyType=SEDAN', label: 'Sedans' },
		{ href: '/inventory?bodyType=WAGON', label: 'Wagons' },
		{ href: '/inventory', label: 'View All' }
	];

	const companyLinks = [
		{ href: '/about', label: 'About Us' },
		{ href: '/finance', label: 'Financing' },
		{ href: '/contact', label: 'Contact' },
		{ href: '/privacy', label: 'Privacy Policy' }
	];

	const hours = [
		{ day: 'Mon–Fri', time: '9:00 AM – 7:00 PM' },
		{ day: 'Saturday', time: '9:00 AM – 6:00 PM' },
		{ day: 'Sunday', time: 'Closed' }
	];
</script>

<footer class="bg-primary text-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Main Footer -->
		<div class="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
			<!-- Brand -->
			<div class="lg:col-span-1">
				<div class="flex items-center gap-2 mb-4">
					<div class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
						<span class="text-white font-bold text-sm">NH</span>
					</div>
					<span class="font-heading text-lg font-bold">New Hope Motors</span>
				</div>
				<p class="text-sm text-white/70 mb-4">
					Giving New Hope in Every Drive. Your trusted independent dealership in McKinney, Texas.
				</p>
				<a
					href="tel:9727678434"
					class="inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors font-semibold"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
					</svg>
					(972) 767-8434
				</a>
			</div>

			<!-- Inventory Links -->
			<div>
				<h3 class="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-white/90">Inventory</h3>
				<ul class="space-y-2">
					{#each inventoryLinks as link}
						<li>
							<a href={link.href} class="text-sm text-white/70 hover:text-white transition-colors">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Company Links -->
			<div>
				<h3 class="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-white/90">Company</h3>
				<ul class="space-y-2">
					{#each companyLinks as link}
						<li>
							<a href={link.href} class="text-sm text-white/70 hover:text-white transition-colors">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Location & Hours -->
			<div>
				<h3 class="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-white/90">Visit Us</h3>
				<address class="not-italic text-sm text-white/70 mb-4">
					<a
						href="https://maps.google.com/?q=3343+FM1827+McKinney+TX+75071"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-white transition-colors"
					>
						3343 FM 1827<br />
						McKinney, TX 75071
					</a>
				</address>
				<div class="space-y-1">
					{#each hours as h}
						<div class="flex justify-between text-sm text-white/70">
							<span>{h.day}</span>
							<span>{h.time}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div class="py-6 border-t border-white/10">
			<div class="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
				<div class="flex flex-col md:flex-row items-center gap-2 md:gap-4">
					<span>&copy; {currentYear} New Hope Motors. All rights reserved.</span>
					<span class="hidden md:inline">·</span>
					<span>Licensed Texas Dealer</span>
				</div>
				<p class="text-center md:text-right max-w-lg">
					Prices exclude tax, title, license &amp; dealer doc fee ($150). See dealer for details. All vehicles subject to prior sale.
				</p>
			</div>
		</div>
	</div>
</footer>
