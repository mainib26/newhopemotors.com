<script lang="ts">
	import { enhance } from '$app/forms';
	import VehicleForm from '$lib/components/admin/vehicles/VehicleForm.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
	let showDeleteConfirm = $state(false);

	// Photo state
	let uploading = $state(false);
	let photos = $state(data.vehicle.photos);
	let dragIdx = $state<number | null>(null);
	let overIdx = $state<number | null>(null);

	// Auto-set primary if only one photo and none is primary
	$effect(() => {
		if (photos.length === 1 && !photos[0].isPrimary) {
			setPrimaryPhoto(photos[0].id);
		}
	});

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
		photos = photos.filter(p => p.id !== photoId);
		await fetch(`/api/admin/photos?id=${photoId}`, { method: 'DELETE' });
		window.location.reload();
	}

	async function setPrimaryPhoto(photoId: string) {
		photos = photos.map(p => ({ ...p, isPrimary: p.id === photoId }));
		await fetch(`/api/admin/photos?id=${photoId}&vehicleId=${data.vehicle.id}`, { method: 'PATCH' });
	}

	// Drag and drop reordering
	function handleDragStart(idx: number) {
		dragIdx = idx;
	}

	function handleDragOver(e: DragEvent, idx: number) {
		e.preventDefault();
		overIdx = idx;
	}

	function handleDragLeave() {
		overIdx = null;
	}

	async function handleDrop(e: DragEvent, dropIdx: number) {
		e.preventDefault();
		overIdx = null;
		if (dragIdx === null || dragIdx === dropIdx) return;

		const reordered = [...photos];
		const [moved] = reordered.splice(dragIdx, 1);
		reordered.splice(dropIdx, 0, moved);
		photos = reordered;
		dragIdx = null;

		// Persist new order
		await fetch('/api/admin/photos', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ order: photos.map(p => p.id) })
		});
	}

	function handleDragEnd() {
		dragIdx = null;
		overIdx = null;
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
			<h3 class="font-heading font-bold text-text">Photos ({photos.length})</h3>
			<label class="cursor-pointer">
				<span class="px-3 py-1.5 text-sm bg-primary text-white rounded-[var(--radius-button)] hover:bg-primary/90">
					{uploading ? 'Uploading...' : '+ Upload Photos'}
				</span>
				<input type="file" accept="image/*" multiple onchange={uploadPhoto} class="hidden" disabled={uploading} />
			</label>
		</div>

		{#if photos.length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{#each photos as photo, i (photo.id)}
					<div
						draggable="true"
						ondragstart={() => handleDragStart(i)}
						ondragover={(e) => handleDragOver(e, i)}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, i)}
						ondragend={handleDragEnd}
						class="relative group rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing transition-all {photo.isPrimary ? 'border-primary border-2' : 'border-border'} {overIdx === i && dragIdx !== i ? 'ring-2 ring-primary/50 scale-[1.02]' : ''} {dragIdx === i ? 'opacity-40' : ''}"
					>
						<img src={photo.url} alt="" class="w-full aspect-[4/3] object-cover pointer-events-none" />
						{#if photo.isPrimary}
							<span class="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] bg-primary text-white rounded">Primary</span>
						{/if}
						<div class="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] bg-black/50 text-white rounded">
							{i + 1}
						</div>
						<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
							{#if !photo.isPrimary}
								<button onclick={() => setPrimaryPhoto(photo.id)} class="px-2 py-1 text-xs bg-white rounded text-text">Set Primary</button>
							{/if}
							<button onclick={() => deletePhoto(photo.id)} class="px-2 py-1 text-xs bg-red-500 text-white rounded">Delete</button>
						</div>
					</div>
				{/each}
			</div>
			<p class="text-xs text-text-light mt-2">Drag photos to reorder. First photo is shown in listings.</p>
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
				await update({ reset: false });
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
