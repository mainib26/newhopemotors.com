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
	let preferredDate = $state('');
	let preferredTime = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let errors = $state<Record<string, string>>({});

	// Generate date options for next 14 days
	const dateOptions = Array.from({ length: 14 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() + i + 1);
		return {
			value: d.toISOString().split('T')[0],
			label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
		};
	});

	const timeOptions = [
		'9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
		'1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
	];

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
		const parts = [];
		if (vehicleName) parts.push(`Vehicle: ${vehicleName}`);
		if (preferredDate) parts.push(`Preferred date: ${preferredDate}`);
		if (preferredTime) parts.push(`Preferred time: ${preferredTime}`);
		parts.push('Request: Schedule Test Drive');
		formData.set('message', parts.join('\n'));

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
		<h3 class="text-lg font-heading font-bold text-text">Test Drive Scheduled!</h3>
		<p class="mt-1 text-sm text-text-muted">We'll confirm your appointment shortly. Call us at <a href="tel:9727678434" class="text-primary font-medium">(972) 767-8434</a> for immediate assistance.</p>
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

		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5">
				<label for="td-date" class="block text-sm font-medium text-text">Preferred Date</label>
				<select id="td-date" bind:value={preferredDate} class="w-full px-3 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface">
					<option value="">Select date</option>
					{#each dateOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
			<div class="space-y-1.5">
				<label for="td-time" class="block text-sm font-medium text-text">Preferred Time</label>
				<select id="td-time" bind:value={preferredTime} class="w-full px-3 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface">
					<option value="">Select time</option>
					{#each timeOptions as t}
						<option value={t}>{t}</option>
					{/each}
				</select>
			</div>
		</div>

		<Button type="submit" fullWidth disabled={submitting}>
			{submitting ? 'Scheduling...' : 'Schedule Test Drive'}
		</Button>
	</form>
{/if}
