<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let firstName = $state('');
	let phone = $state('');
	let email = $state('');
	let message = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let errors = $state<Record<string, string>>({});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;
		errors = {};

		const formData = new FormData();
		formData.set('firstName', firstName);
		formData.set('phone', phone);
		formData.set('email', email);
		formData.set('message', message);

		try {
			const res = await fetch('/api/contact', { method: 'POST', body: formData });
			const data = await res.json();

			if (data.success) {
				submitted = true;
			} else {
				errors = data.errors || {};
			}
		} catch {
			errors = { _form: 'Network error. Please try again.' };
		} finally {
			submitting = false;
		}
	}

	const hours = [
		{ day: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
		{ day: 'Saturday', time: '9:00 AM – 6:00 PM' },
		{ day: 'Sunday', time: 'Closed' }
	];

	const nearbyCities = [
		{ name: 'From Frisco', time: '~15 min', direction: 'North on US-75, exit FM 1827' },
		{ name: 'From Allen', time: '~10 min', direction: 'West on US-75, exit FM 1827' },
		{ name: 'From Plano', time: '~20 min', direction: 'North on US-75, exit FM 1827' },
		{ name: 'From Prosper', time: '~15 min', direction: 'East on US-380, south on FM 1827' }
	];
</script>

<svelte:head>
	<title>Contact Us — New Hope Motors, McKinney TX</title>
	<meta name="description" content="Contact New Hope Motors in McKinney, TX. Visit us at 3343 FM 1827, call (972) 767-8434, or send us a message. Serving McKinney, Frisco, Allen, Plano, and Prosper." />
</svelte:head>

<div class="bg-background">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
			<!-- Contact Form -->
			<div>
				<h2 class="text-2xl font-heading font-bold text-text mb-6">Send Us a Message</h2>

				{#if submitted}
					<div class="bg-surface border border-border rounded-[var(--radius-card)] p-8 text-center">
						<div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
							<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 class="text-xl font-heading font-bold text-text">Message Sent!</h3>
						<p class="mt-2 text-text-muted">We'll get back to you within 1 business day.</p>
					</div>
				{:else}
					<form onsubmit={handleSubmit} class="bg-surface border border-border rounded-[var(--radius-card)] p-6 space-y-4">
						{#if errors._form}
							<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">{errors._form}</div>
						{/if}

						<Input label="Name" bind:value={firstName} placeholder="Your name" required error={errors.firstName} />
						<Input label="Phone" type="tel" bind:value={phone} placeholder="(555) 123-4567" error={errors.phone} />
						<Input label="Email" type="email" bind:value={email} placeholder="you@example.com" error={errors.email} />

						<div class="space-y-1.5">
							<label for="contact-message" class="block text-sm font-medium text-text">Message</label>
							<textarea
								id="contact-message"
								bind:value={message}
								rows="4"
								placeholder="How can we help you?"
								class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary resize-none"
							></textarea>
						</div>

						<Button type="submit" fullWidth disabled={submitting}>
							{submitting ? 'Sending...' : 'Send Message'}
						</Button>
					</form>
				{/if}
			</div>

			<!-- Info -->
			<div class="space-y-8">
				<!-- Quick Contact -->
				<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6 space-y-5">
					<h3 class="font-heading font-bold text-text">Get in Touch</h3>
					<div class="flex items-start gap-4">
						<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
							</svg>
						</div>
						<div>
							<a href="tel:9727678434" class="font-semibold text-text hover:text-primary">(972) 767-8434</a>
							<p class="text-sm text-text-muted">Call or text anytime</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<div>
							<p class="font-semibold text-text">3343 FM 1827</p>
							<p class="text-sm text-text-muted">McKinney, TX 75071</p>
						</div>
					</div>
				</div>

				<!-- Hours -->
				<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6">
					<h3 class="font-heading font-bold text-text mb-4">Business Hours</h3>
					<div class="space-y-2">
						{#each hours as h}
							<div class="flex justify-between text-sm">
								<span class="text-text-muted">{h.day}</span>
								<span class="font-medium text-text">{h.time}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Directions -->
				<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6">
					<h3 class="font-heading font-bold text-text mb-4">Directions from Nearby Cities</h3>
					<div class="space-y-3">
						{#each nearbyCities as city}
							<div class="flex items-start gap-3">
								<div class="w-2 h-2 mt-1.5 rounded-full bg-accent shrink-0"></div>
								<div>
									<p class="text-sm font-medium text-text">{city.name} <span class="text-text-light">({city.time})</span></p>
									<p class="text-xs text-text-muted">{city.direction}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Map -->
		<div class="mt-12 rounded-[var(--radius-card)] overflow-hidden h-80 border border-border">
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
