<script lang="ts">
	import { enhance } from '$app/forms';
	import VehicleForm from '$lib/components/admin/vehicles/VehicleForm.svelte';

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Add Vehicle — Admin</title>
</svelte:head>

<div class="max-w-4xl">
	<h1 class="text-2xl font-heading font-bold text-text mb-6">Add Vehicle</h1>
	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
	>
		<VehicleForm errors={form?.errors ?? {}} {submitting} />
	</form>
</div>
