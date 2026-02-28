<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	let search = $state(data.filters.search);
	let statusFilter = $state(data.filters.status);

	function applyFilters() {
		const params = new URLSearchParams();
		if (search) params.set('q', search);
		if (statusFilter) params.set('status', statusFilter);
		goto(`/admin/vehicles?${params.toString()}`);
	}

	function formatPrice(p: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
	}

	let deleteTarget = $state<{ id: string; name: string } | null>(null);
	let deleting = $state(false);

	async function confirmDelete() {
		if (!deleteTarget) return;
		deleting = true;
		await fetch(`/api/admin/vehicles/${deleteTarget.id}`, { method: 'DELETE' });
		deleteTarget = null;
		deleting = false;
		window.location.reload();
	}

	const statusVariant: Record<string, string> = {
		ACTIVE: 'success',
		INCOMING: 'warning',
		IN_RECON: 'warning',
		SOLD: 'default',
		DELETED: 'default'
	};
</script>

<svelte:head>
	<title>Vehicles — Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-heading font-bold text-text">Vehicles</h1>
		<Button href="/admin/vehicles/new">+ Add Vehicle</Button>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-3">
		<input
			type="text"
			placeholder="Search make, model, VIN, stock#..."
			bind:value={search}
			onkeydown={(e) => e.key === 'Enter' && applyFilters()}
			class="px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text w-64 focus:outline-none focus:ring-2 focus:ring-primary"
		/>
		<select
			bind:value={statusFilter}
			onchange={applyFilters}
			class="px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
		>
			<option value="">All Statuses</option>
			<option value="ACTIVE">Active</option>
			<option value="INCOMING">Incoming</option>
			<option value="IN_RECON">In Recon</option>
			<option value="SOLD">Sold</option>
		</select>
		<span class="text-sm text-text-muted self-center">{data.total} vehicles</span>
	</div>

	<!-- Table -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="bg-background border-b border-border text-left">
						<th class="px-4 py-3 font-medium text-text-muted">Photo</th>
						<th class="px-4 py-3 font-medium text-text-muted">Stock #</th>
						<th class="px-4 py-3 font-medium text-text-muted">Vehicle</th>
						<th class="px-4 py-3 font-medium text-text-muted">Price</th>
						<th class="px-4 py-3 font-medium text-text-muted">Mileage</th>
						<th class="px-4 py-3 font-medium text-text-muted">Status</th>
						<th class="px-4 py-3 font-medium text-text-muted">Days</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody>
					{#each data.vehicles as v}
						<tr class="border-b border-border/50 hover:bg-background/50">
							<td class="px-4 py-2">
								{#if v.photo}
									<img src={v.photo} alt="" class="w-16 h-12 object-cover rounded" />
								{:else}
									<div class="w-16 h-12 bg-background rounded flex items-center justify-center text-text-light text-xs">No photo</div>
								{/if}
							</td>
							<td class="px-4 py-2 font-mono text-xs text-text-muted">{v.stockNumber ?? '—'}</td>
							<td class="px-4 py-2">
								<a href="/admin/vehicles/{v.id}" class="font-medium text-text hover:text-primary">
									{v.year} {v.make} {v.model}
								</a>
								{#if v.trim}<span class="text-text-muted"> {v.trim}</span>{/if}
							</td>
							<td class="px-4 py-2 font-medium text-text">{formatPrice(v.price)}</td>
							<td class="px-4 py-2 text-text-muted">{v.mileage?.toLocaleString() ?? '—'} mi</td>
							<td class="px-4 py-2"><Badge variant={statusVariant[v.status] ?? 'default'}>{v.status}</Badge></td>
							<td class="px-4 py-2 text-text-muted">{v.daysOnLot}d</td>
							<td class="px-4 py-2">
								<div class="flex items-center gap-3">
									<a href="/admin/vehicles/{v.id}" class="text-primary text-sm hover:underline">Edit</a>
									<button onclick={() => deleteTarget = { id: v.id, name: `${v.year} ${v.make} ${v.model}` }} class="text-red-500 text-sm hover:underline">Delete</button>
								</div>
							</td>
						</tr>
					{/each}
					{#if data.vehicles.length === 0}
						<tr><td colspan="8" class="px-4 py-12 text-center text-text-muted">No vehicles found</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination -->
	{#if data.totalPages > 1}
		<div class="flex justify-center gap-2">
			{#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as p}
				<a
					href="/admin/vehicles?page={p}{statusFilter ? `&status=${statusFilter}` : ''}{search ? `&q=${search}` : ''}"
					class="px-3 py-1 text-sm rounded-[var(--radius-button)] {p === data.page
						? 'bg-primary text-white'
						: 'bg-surface border border-border text-text hover:bg-background'}"
				>
					{p}
				</a>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if deleteTarget}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		onkeydown={(e) => e.key === 'Escape' && (deleteTarget = null)}
	>
		<div class="absolute inset-0 bg-black/50" onclick={() => deleteTarget = null}></div>
		<div class="relative bg-surface rounded-[var(--radius-card)] shadow-xl p-6 w-full max-w-sm mx-4">
			<h3 class="text-lg font-heading font-bold text-text">Delete Vehicle</h3>
			<p class="mt-2 text-sm text-text-muted">
				Are you sure you want to delete <strong class="text-text">{deleteTarget.name}</strong>? This action cannot be undone.
			</p>
			<div class="mt-6 flex justify-end gap-3">
				<Button variant="secondary" onclick={() => deleteTarget = null} disabled={deleting}>Cancel</Button>
				<button
					onclick={confirmDelete}
					disabled={deleting}
					class="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-[var(--radius-button)] hover:bg-red-700 disabled:opacity-50 transition-colors"
				>
					{deleting ? 'Deleting...' : 'Delete'}
				</button>
			</div>
		</div>
	</div>
{/if}
