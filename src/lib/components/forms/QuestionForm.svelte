<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	interface Props {
		vehicleId?: string;
		vehicleName?: string;
		onSuccess?: () => void;
	}

	let { vehicleId = '', vehicleName = '', onSuccess }: Props = $props();

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
		if (vehicleId) formData.set('vehicleId', vehicleId);
		formData.set('source', 'WEBSITE');
		const fullMessage = vehicleName ? `Re: ${vehicleName}\n\n${message}` : message;
		formData.set('message', fullMessage);

		try {
			const res = await fetch('/api/leads', { method: 'POST', body: formData });
			const data = await res.json();

			if (data.success) {
				submitted = true;
				onSuccess?.();
			} else {
				errors = data.errors || {};
			}
		} catch {
			errors = { _form: 'Network error. Please try again.' };
		} finally {
			submitting = false;
		}
	}
</script>

{#if submitted}
	<div class="text-center py-4">
		<div class="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
			<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		</div>
		<h3 class="text-lg font-heading font-bold text-text">Message Sent!</h3>
		<p class="mt-1 text-sm text-text-muted">We'll get back to you soon. Call <a href="tel:9727678434" class="text-primary font-medium">(972) 767-8434</a> for immediate help.</p>
	</div>
{:else}
	<form onsubmit={handleSubmit} class="space-y-4">
		{#if errors._form}
			<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">
				{errors._form}
			</div>
		{/if}

		<Input label="Name" bind:value={firstName} placeholder="Your name" required error={errors.firstName} />
		<Input label="Phone" type="tel" bind:value={phone} placeholder="(555) 123-4567" error={errors.phone} />
		<Input label="Email" type="email" bind:value={email} placeholder="you@example.com" error={errors.email} />

		<div class="space-y-1.5">
			<label for="q-message" class="block text-sm font-medium text-text">Your Question</label>
			<textarea
				id="q-message"
				bind:value={message}
				rows="3"
				placeholder="What would you like to know?"
				class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary resize-none"
			></textarea>
		</div>

		<Button type="submit" fullWidth disabled={submitting}>
			{submitting ? 'Sending...' : 'Send Question'}
		</Button>
	</form>
{/if}
