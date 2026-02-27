<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let step = $state(1);
	let submitting = $state(false);
	let submitted = $state(false);
	let errors = $state<Record<string, string>>({});

	// Step 1: Personal
	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let phone = $state('');

	// Step 2: Employment
	let employmentStatus = $state('');
	let monthlyIncome = $state('');
	let housingStatus = $state('');
	let monthlyHousingPayment = $state('');

	// Step 3: Vehicle Interest
	let vehicleInterest = $state('');
	let downPaymentAmount = $state('');

	function nextStep() {
		if (step === 1) {
			errors = {};
			if (!firstName) errors.firstName = 'Required';
			if (!lastName) errors.lastName = 'Required';
			if (!phone) errors.phone = 'Required';
			if (Object.keys(errors).length > 0) return;
		}
		step = Math.min(step + 1, 3);
	}

	function prevStep() {
		step = Math.max(step - 1, 1);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;
		errors = {};

		const formData = new FormData();
		formData.set('firstName', firstName);
		formData.set('lastName', lastName);
		formData.set('email', email);
		formData.set('phone', phone);
		formData.set('employmentStatus', employmentStatus);
		formData.set('monthlyIncome', monthlyIncome);
		formData.set('housingStatus', housingStatus);
		formData.set('monthlyHousingPayment', monthlyHousingPayment);
		formData.set('vehicleInterest', vehicleInterest);
		formData.set('downPaymentAmount', downPaymentAmount);

		try {
			const res = await fetch('/api/finance', { method: 'POST', body: formData });
			const data = await res.json();

			if (data.success) {
				submitted = true;
			} else {
				errors = data.errors || {};
				if (errors.firstName || errors.lastName || errors.phone) step = 1;
			}
		} catch {
			errors = { _form: 'Network error. Please try again.' };
		} finally {
			submitting = false;
		}
	}
</script>

{#if submitted}
	<div class="text-center py-8">
		<div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
			<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		</div>
		<h3 class="text-xl font-heading font-bold text-text">Application Submitted!</h3>
		<p class="mt-2 text-text-muted max-w-md mx-auto">
			Thank you, {firstName}! We're reviewing your application and will reach out within 1 business day.
			For faster service, call us at <a href="tel:9727678434" class="text-primary font-medium">(972) 767-8434</a>.
		</p>
	</div>
{:else}
	<form onsubmit={handleSubmit}>
		<!-- Progress -->
		<div class="flex items-center gap-2 mb-8">
			{#each [1, 2, 3] as s}
				<div class="flex-1 h-2 rounded-full {s <= step ? 'bg-primary' : 'bg-border'} transition-colors"></div>
			{/each}
		</div>
		<p class="text-sm text-text-muted mb-6">Step {step} of 3: {step === 1 ? 'Personal Info' : step === 2 ? 'Employment' : 'Vehicle Interest'}</p>

		{#if errors._form}
			<div class="p-3 mb-4 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">{errors._form}</div>
		{/if}

		{#if step === 1}
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<Input label="First Name" bind:value={firstName} required error={errors.firstName} />
					<Input label="Last Name" bind:value={lastName} required error={errors.lastName} />
				</div>
				<Input label="Phone" type="tel" bind:value={phone} placeholder="(555) 123-4567" required error={errors.phone} />
				<Input label="Email" type="email" bind:value={email} placeholder="you@example.com" error={errors.email} />
			</div>
		{:else if step === 2}
			<div class="space-y-4">
				<div class="space-y-1.5">
					<label for="pq-employment" class="block text-sm font-medium text-text">Employment Status</label>
					<select id="pq-employment" bind:value={employmentStatus} class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface">
						<option value="">Select...</option>
						<option value="employed">Employed Full-Time</option>
						<option value="part-time">Employed Part-Time</option>
						<option value="self-employed">Self-Employed</option>
						<option value="retired">Retired</option>
						<option value="other">Other</option>
					</select>
				</div>
				<Input label="Monthly Income" type="number" bind:value={monthlyIncome} placeholder="5000" />
				<div class="space-y-1.5">
					<label for="pq-housing" class="block text-sm font-medium text-text">Housing Status</label>
					<select id="pq-housing" bind:value={housingStatus} class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface">
						<option value="">Select...</option>
						<option value="own">Own</option>
						<option value="rent">Rent</option>
						<option value="family">Living with Family</option>
						<option value="other">Other</option>
					</select>
				</div>
				<Input label="Monthly Housing Payment" type="number" bind:value={monthlyHousingPayment} placeholder="1500" />
			</div>
		{:else}
			<div class="space-y-4">
				<div class="space-y-1.5">
					<label for="pq-vehicle" class="block text-sm font-medium text-text">Vehicle of Interest</label>
					<textarea
						id="pq-vehicle"
						bind:value={vehicleInterest}
						rows="2"
						placeholder="e.g., 2021 Toyota Tundra SR5 or any SUV under $35K"
						class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface resize-none"
					></textarea>
				</div>
				<Input label="Estimated Down Payment" type="number" bind:value={downPaymentAmount} placeholder="3000" />
			</div>
		{/if}

		<div class="flex gap-3 mt-8">
			{#if step > 1}
				<Button type="button" variant="secondary" onclick={prevStep}>Back</Button>
			{/if}
			{#if step < 3}
				<Button type="button" onclick={nextStep} fullWidth>Continue</Button>
			{:else}
				<Button type="submit" fullWidth disabled={submitting}>
					{submitting ? 'Submitting...' : 'Submit Application'}
				</Button>
			{/if}
		</div>

		<p class="mt-4 text-xs text-text-light text-center">
			This is a pre-qualification inquiry only. Submitting this form does not guarantee financing.
			Your information is encrypted and secure.
		</p>
	</form>
{/if}
