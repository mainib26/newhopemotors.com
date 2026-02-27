<script lang="ts">
	import { enhance } from '$app/forms';
	import VehicleForm from '$lib/components/admin/vehicles/VehicleForm.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
	let showDeleteConfirm = $state(false);

	// Photo upload state
	let uploading = $state(false);

	async function uploadPhoto(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		uploading = true;
		const formData = new FormData();
		for (const file of input.files) {
			formData.append('photos', file);
		}
		formData.append('vehicleId', data.vehicle.id);

		try {
			const res = await fetch('/api/admin/photos', { method: 'POST', body: formData });
			if (res.ok) {
				window.location.reload();
			}
		} finally {
			uploading = false;
		}
	}

	async function deletePhoto(photoId: string) {
		await fetch(`/api/admin/photos?id=${photoId}`, { method: 'DELETE' });
		window.location.reload();
	}

	async function setPrimaryPhoto(photoId: string) {
		await fetch(`/api/admin/photos?id=${photoId}&vehicleId=${data.vehicle.id}`, { method: 'PATCH' });
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Edit {data.vehicle.year} {data.vehicle.make} {data.vehicle.model} — Admin</title>
</svelte:head>

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-heading font-bold text-text">
			Edit {data.vehicle.year} {data.vehicle.make} {data.vehicle.model}
		</h1>
	</div>

	<!-- Photo Manager -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 mb-6">
		<div class="flex items-center justify-between mb-4">
			<h3 class="font-heading font-bold text-text">Photos ({data.vehicle.photos.length})</h3>
			<label class="cursor-pointer">
				<span class="px-3 py-1.5 text-sm bg-primary text-white rounded-[var(--radius-button)] hover:bg-primary/90">
					{uploading ? 'Uploading...' : '+ Upload Photos'}
				</span>
				<input type="file" accept="image/*" multiple onchange={uploadPhoto} class="hidden" disabled={uploading} />
			</label>
		</div>

		{#if data.vehicle.photos.length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{#each data.vehicle.photos as photo}
					<div class="relative group rounded-lg overflow-hidden border {photo.isPrimary ? 'border-primary border-2' : 'border-border'}">
						<img src={photo.url} alt="" class="w-full aspect-[4/3] object-cover" />
						{#if photo.isPrimary}
							<span class="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] bg-primary text-white rounded">Primary</span>
						{/if}
						<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
							{#if !photo.isPrimary}
								<button onclick={() => setPrimaryPhoto(photo.id)} class="px-2 py-1 text-xs bg-white rounded text-text">Set Primary</button>
							{/if}
							<button onclick={() => deletePhoto(photo.id)} class="px-2 py-1 text-xs bg-red-500 text-white rounded">Delete</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-text-muted py-4 text-center">No photos yet. Upload some to get started.</p>
		{/if}
	</div>

	<!-- Vehicle Form -->
	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
	>
		{#if form?.success}
			<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-[var(--radius-button)] text-sm text-green-700">Vehicle updated successfully.</div>
		{/if}
		<VehicleForm vehicle={data.vehicle} errors={form?.errors ?? {}} {submitting} />
	</form>

	<!-- Delete -->
	<div class="mt-8 pt-6 border-t border-border">
		{#if showDeleteConfirm}
			<div class="flex items-center gap-3">
				<p class="text-sm text-red-600">Are you sure? This cannot be undone.</p>
				<form method="POST" action="?/delete">
					<Button type="submit" variant="secondary">Yes, Delete</Button>
				</form>
				<Button variant="secondary" onclick={() => showDeleteConfirm = false}>Cancel</Button>
			</div>
		{:else}
			<button onclick={() => showDeleteConfirm = true} class="text-sm text-red-500 hover:underline">Delete this vehicle</button>
		{/if}
	</div>
</div>
