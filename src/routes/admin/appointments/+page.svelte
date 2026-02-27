<script lang="ts">
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { data, form } = $props();

	let showCreate = $state(false);

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
	}

	const statusVariant: Record<string, string> = {
		SCHEDULED: 'warning',
		CONFIRMED: 'primary',
		COMPLETED: 'success',
		CANCELLED: 'default',
		NO_SHOW: 'default'
	};
</script>

<svelte:head>
	<title>Appointments — Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-heading font-bold text-text">Appointments</h1>
		<Button onclick={() => showCreate = true}>+ New Appointment</Button>
	</div>

	<!-- List -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="bg-background border-b border-border text-left">
						<th class="px-4 py-3 font-medium text-text-muted">Date/Time</th>
						<th class="px-4 py-3 font-medium text-text-muted">Type</th>
						<th class="px-4 py-3 font-medium text-text-muted">Customer</th>
						<th class="px-4 py-3 font-medium text-text-muted">Vehicle</th>
						<th class="px-4 py-3 font-medium text-text-muted">Status</th>
						<th class="px-4 py-3 font-medium text-text-muted">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.appointments as appt}
						<tr class="border-b border-border/50 hover:bg-background/50">
							<td class="px-4 py-2.5 font-medium text-text">{formatDate(appt.date)}</td>
							<td class="px-4 py-2.5"><Badge variant="default">{appt.type.replace('_', ' ')}</Badge></td>
							<td class="px-4 py-2.5">
								<p class="text-text">{appt.leadName}</p>
								{#if appt.leadPhone}<p class="text-xs text-text-muted">{appt.leadPhone}</p>{/if}
							</td>
							<td class="px-4 py-2.5 text-text-muted">{appt.vehicle ?? '—'}</td>
							<td class="px-4 py-2.5"><Badge variant={statusVariant[appt.status] ?? 'default'}>{appt.status}</Badge></td>
							<td class="px-4 py-2.5">
								<form method="POST" action="?/updateStatus" use:enhance class="flex gap-1">
									<input type="hidden" name="id" value={appt.id} />
									{#if appt.status === 'SCHEDULED'}
										<button type="submit" name="status" value="CONFIRMED" class="text-xs text-primary hover:underline">Confirm</button>
										<button type="submit" name="status" value="CANCELLED" class="text-xs text-red-500 hover:underline">Cancel</button>
									{:else if appt.status === 'CONFIRMED'}
										<button type="submit" name="status" value="COMPLETED" class="text-xs text-green-600 hover:underline">Completed</button>
										<button type="submit" name="status" value="NO_SHOW" class="text-xs text-red-500 hover:underline">No Show</button>
									{/if}
								</form>
							</td>
						</tr>
					{/each}
					{#if data.appointments.length === 0}
						<tr><td colspan="6" class="px-4 py-12 text-center text-text-muted">No appointments scheduled</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Create Modal -->
<Modal open={showCreate} onclose={() => showCreate = false} title="New Appointment">
	<form method="POST" action="?/create" use:enhance={() => {
		return async ({ update }) => {
			showCreate = false;
			await update();
		};
	}}>
		<div class="space-y-4">
			<div class="space-y-1.5">
				<label for="appt-lead" class="block text-sm font-medium text-text">Customer</label>
				<select id="appt-lead" name="leadId" required class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text">
					<option value="">Select a lead...</option>
					{#each data.leads as l}
						<option value={l.id}>{l.name}</option>
					{/each}
				</select>
			</div>
			<div class="space-y-1.5">
				<label for="appt-vehicle" class="block text-sm font-medium text-text">Vehicle</label>
				<select id="appt-vehicle" name="vehicleId" class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text">
					<option value="">Select a vehicle...</option>
					{#each data.vehicles as v}
						<option value={v.id}>{v.label}</option>
					{/each}
				</select>
			</div>
			<div class="space-y-1.5">
				<label for="appt-type" class="block text-sm font-medium text-text">Type</label>
				<select id="appt-type" name="type" class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text">
					<option value="TEST_DRIVE">Test Drive</option>
					<option value="SHOWING">Showing</option>
					<option value="DELIVERY">Delivery</option>
					<option value="OTHER">Other</option>
				</select>
			</div>
			<div class="space-y-1.5">
				<label for="appt-date" class="block text-sm font-medium text-text">Date & Time</label>
				<input id="appt-date" name="date" type="datetime-local" required class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text" />
			</div>
			<div class="space-y-1.5">
				<label for="appt-notes" class="block text-sm font-medium text-text">Notes</label>
				<input id="appt-notes" name="notes" class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text" placeholder="Optional notes" />
			</div>
			<Button type="submit" fullWidth>Create Appointment</Button>
		</div>
	</form>
</Modal>
