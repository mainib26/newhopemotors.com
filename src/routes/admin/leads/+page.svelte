<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/Badge.svelte';

	let { data } = $props();

	let search = $state(data.filters.search);
	let statusFilter = $state(data.filters.status);

	function applyFilters() {
		const params = new URLSearchParams();
		if (search) params.set('q', search);
		if (statusFilter) params.set('status', statusFilter);
		goto(`/admin/leads?${params.toString()}`);
	}

	function timeAgo(dateStr: string): string {
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		return `${Math.floor(hrs / 24)}d ago`;
	}

	type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error';

const statusVariant: Record<string, BadgeVariant> = {
		NEW: 'primary',
		CONTACTED: 'warning',
		APPOINTMENT_SET: 'info',
		SHOWED: 'success',
		SOLD: 'success',
		LOST: 'default'
	};

	const statuses = ['NEW', 'CONTACTED', 'APPOINTMENT_SET', 'SHOWED', 'SOLD', 'LOST'];
</script>

<svelte:head>
	<title>Leads — Admin</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-heading font-bold text-text">Leads</h1>

	<!-- Status Tabs -->
	<div class="flex gap-2 overflow-x-auto">
		<button
			onclick={() => { statusFilter = ''; applyFilters(); }}
			class="px-3 py-1.5 text-sm rounded-[var(--radius-button)] whitespace-nowrap {!statusFilter ? 'bg-primary text-white' : 'bg-surface border border-border text-text hover:bg-background'}"
		>
			All ({data.total})
		</button>
		{#each statuses as s}
			<button
				onclick={() => { statusFilter = s; applyFilters(); }}
				class="px-3 py-1.5 text-sm rounded-[var(--radius-button)] whitespace-nowrap {statusFilter === s ? 'bg-primary text-white' : 'bg-surface border border-border text-text hover:bg-background'}"
			>
				{s.replace('_', ' ')} ({data.statusCounts[s] ?? 0})
			</button>
		{/each}
	</div>

	<!-- Search -->
	<input
		type="text"
		placeholder="Search by name, email, or phone..."
		bind:value={search}
		onkeydown={(e) => e.key === 'Enter' && applyFilters()}
		class="px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text w-72 focus:outline-none focus:ring-2 focus:ring-primary"
	/>

	<!-- Table -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="bg-background border-b border-border text-left">
						<th class="px-4 py-3 font-medium text-text-muted">Name</th>
						<th class="px-4 py-3 font-medium text-text-muted">Contact</th>
						<th class="px-4 py-3 font-medium text-text-muted">Vehicle</th>
						<th class="px-4 py-3 font-medium text-text-muted">Source</th>
						<th class="px-4 py-3 font-medium text-text-muted">Status</th>
						<th class="px-4 py-3 font-medium text-text-muted">Assigned</th>
						<th class="px-4 py-3 font-medium text-text-muted text-right">When</th>
					</tr>
				</thead>
				<tbody>
					{#each data.leads as lead}
						<tr class="border-b border-border/50 hover:bg-background/50">
							<td class="px-4 py-2.5">
								<a href="/admin/leads/{lead.id}" class="font-medium text-text hover:text-primary">{lead.name}</a>
							</td>
							<td class="px-4 py-2.5 text-text-muted">
								<div>{lead.phone ?? ''}</div>
								<div class="text-xs">{lead.email ?? ''}</div>
							</td>
							<td class="px-4 py-2.5 text-text-muted">{lead.vehicle ?? '—'}</td>
							<td class="px-4 py-2.5"><Badge variant="default">{lead.source}</Badge></td>
							<td class="px-4 py-2.5"><Badge variant={getStatusVariant(lead.status)}>{lead.status.replace('_', ' ')}</Badge></td>
							<td class="px-4 py-2.5 text-text-muted">{lead.assignedTo ?? '—'}</td>
							<td class="px-4 py-2.5 text-text-muted text-right">{timeAgo(lead.createdAt)}</td>
						</tr>
					{/each}
					{#if data.leads.length === 0}
						<tr><td colspan="7" class="px-4 py-12 text-center text-text-muted">No leads found</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
