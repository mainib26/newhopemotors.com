<script lang="ts">
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/ui/Badge.svelte';

	let { data } = $props();

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error';

const statusVariant: Record<string, BadgeVariant> = {
		PENDING: 'warning', REVIEWING: 'primary', APPROVED: 'success', DENIED: 'default'
	};

const getStatusVariant = (status: string): BadgeVariant => statusVariant[status] ?? 'default';
</script>

<svelte:head><title>Finance Applications — Admin</title></svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-heading font-bold text-text">Finance Applications</h1>

	<div class="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="bg-background border-b border-border text-left">
						<th class="px-4 py-3 font-medium text-text-muted">Name</th>
						<th class="px-4 py-3 font-medium text-text-muted">Contact</th>
						<th class="px-4 py-3 font-medium text-text-muted">Vehicle Interest</th>
						<th class="px-4 py-3 font-medium text-text-muted">Status</th>
						<th class="px-4 py-3 font-medium text-text-muted">Date</th>
						<th class="px-4 py-3 font-medium text-text-muted">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.applications as app}
						<tr class="border-b border-border/50 hover:bg-background/50">
							<td class="px-4 py-2.5 font-medium text-text">{app.firstName} {app.lastName}</td>
							<td class="px-4 py-2.5 text-text-muted">
								<div>{app.phone}</div>
								<div class="text-xs">{app.email}</div>
							</td>
							<td class="px-4 py-2.5 text-text-muted">{app.vehicleInterest ?? '—'}</td>
							<td class="px-4 py-2.5"><Badge variant={getStatusVariant(app.status)}>{app.status}</Badge></td>
							<td class="px-4 py-2.5 text-text-muted">{formatDate(app.createdAt)}</td>
							<td class="px-4 py-2.5">
								<form method="POST" action="?/updateStatus" use:enhance class="flex gap-1">
									<input type="hidden" name="id" value={app.id} />
									{#if app.status === 'PENDING'}
										<button type="submit" name="status" value="REVIEWING" class="text-xs text-primary hover:underline">Review</button>
									{:else if app.status === 'REVIEWING'}
										<button type="submit" name="status" value="APPROVED" class="text-xs text-green-600 hover:underline">Approve</button>
										<button type="submit" name="status" value="DENIED" class="text-xs text-red-500 hover:underline">Deny</button>
									{/if}
								</form>
							</td>
						</tr>
					{/each}
					{#if data.applications.length === 0}
						<tr><td colspan="6" class="px-4 py-12 text-center text-text-muted">No applications yet</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
