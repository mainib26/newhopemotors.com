<script lang="ts">
	import StatCard from '$lib/components/admin/StatCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let { data } = $props();

	const pipelineStages = [
		{ key: 'NEW', label: 'New' },
		{ key: 'CONTACTED', label: 'Contacted' },
		{ key: 'APPOINTMENT_SET', label: 'Appt Set' },
		{ key: 'SHOWED', label: 'Showed' },
		{ key: 'SOLD', label: 'Sold' }
	];

	function timeAgo(dateStr: string): string {
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		return `${Math.floor(hrs / 24)}d ago`;
	}
</script>

<svelte:head>
	<title>Dashboard — Admin</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-heading font-bold text-text">Dashboard</h1>

	<!-- Stat Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<StatCard
			label="Active Inventory"
			value={data.stats.activeVehicles}
			icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
		/>
		<StatCard
			label="New Leads Today"
			value={data.stats.newLeadsToday}
			icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
		/>
		<StatCard
			label="Today's Appointments"
			value={data.stats.appointmentsToday}
			icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
		/>
		<StatCard
			label="Sold This Month"
			value={data.stats.soldThisMonth}
			icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</div>

	<!-- Lead Pipeline -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
		<h2 class="font-heading font-bold text-text mb-4">Lead Pipeline</h2>
		<div class="flex gap-2 overflow-x-auto">
			{#each pipelineStages as stage}
				<div class="flex-1 min-w-[120px] bg-background rounded-lg p-4 text-center">
					<p class="text-2xl font-bold text-text">{data.pipeline[stage.key] ?? 0}</p>
					<p class="text-xs text-text-muted mt-1">{stage.label}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Recent Leads -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
		<div class="flex items-center justify-between mb-4">
			<h2 class="font-heading font-bold text-text">Recent Leads</h2>
			<a href="/admin/leads" class="text-sm text-primary hover:underline">View all →</a>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="pb-2 font-medium text-text-muted">Name</th>
						<th class="pb-2 font-medium text-text-muted">Vehicle</th>
						<th class="pb-2 font-medium text-text-muted">Source</th>
						<th class="pb-2 font-medium text-text-muted">Status</th>
						<th class="pb-2 font-medium text-text-muted text-right">When</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentLeads as lead}
						<tr class="border-b border-border/50 hover:bg-background/50">
							<td class="py-2.5">
								<a href="/admin/leads/{lead.id}" class="font-medium text-text hover:text-primary">{lead.name}</a>
								<p class="text-xs text-text-muted">{lead.phone ?? lead.email ?? ''}</p>
							</td>
							<td class="py-2.5 text-text-muted">{lead.vehicle ?? '—'}</td>
							<td class="py-2.5"><Badge variant="default">{lead.source}</Badge></td>
							<td class="py-2.5"><Badge variant={lead.status === 'NEW' ? 'primary' : 'default'}>{lead.status}</Badge></td>
							<td class="py-2.5 text-text-muted text-right">{timeAgo(lead.createdAt)}</td>
						</tr>
					{/each}
					{#if data.recentLeads.length === 0}
						<tr><td colspan="5" class="py-8 text-center text-text-muted">No leads yet</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
