<script lang="ts">
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();

	const statuses = ['NEW', 'CONTACTED', 'APPOINTMENT_SET', 'SHOWED', 'SOLD', 'LOST'];

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>{data.lead.firstName} {data.lead.lastName ?? ''} — Lead Detail</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a href="/admin/leads" class="text-text-muted hover:text-text">← Leads</a>
		<h1 class="text-2xl font-heading font-bold text-text">{data.lead.firstName} {data.lead.lastName ?? ''}</h1>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Main Info -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Contact Info -->
			<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
				<h3 class="font-heading font-bold text-text mb-3">Contact Info</h3>
				<div class="grid grid-cols-2 gap-4 text-sm">
					{#if data.lead.phone}
						<div>
							<span class="text-text-muted">Phone</span>
							<a href="tel:{data.lead.phone}" class="block font-medium text-text hover:text-primary">{data.lead.phone}</a>
						</div>
					{/if}
					{#if data.lead.email}
						<div>
							<span class="text-text-muted">Email</span>
							<a href="mailto:{data.lead.email}" class="block font-medium text-text hover:text-primary">{data.lead.email}</a>
						</div>
					{/if}
					{#if data.lead.vehicle}
						<div>
							<span class="text-text-muted">Vehicle Interest</span>
							<a href="/admin/vehicles/{data.lead.vehicle.id}" class="block font-medium text-text hover:text-primary">
								{data.lead.vehicle.year} {data.lead.vehicle.make} {data.lead.vehicle.model} {data.lead.vehicle.trim ?? ''}
							</a>
						</div>
					{/if}
					<div>
						<span class="text-text-muted">Source</span>
						<p class="font-medium text-text">{data.lead.source}</p>
					</div>
				</div>
				{#if data.lead.message}
					<div class="mt-4 pt-4 border-t border-border">
						<span class="text-sm text-text-muted">Message</span>
						<p class="text-sm text-text mt-1">{data.lead.message}</p>
					</div>
				{/if}
			</div>

			<!-- Notes -->
			<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
				<h3 class="font-heading font-bold text-text mb-3">Notes</h3>
				<form method="POST" action="?/addNote" use:enhance class="mb-4">
					<div class="flex gap-2">
						<input
							name="content"
							placeholder="Add a note..."
							class="flex-1 px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
						/>
						<Button type="submit" size="sm">Add</Button>
					</div>
				</form>

				<div class="space-y-3">
					{#each data.lead.notes as note}
						<div class="border-l-2 border-primary/30 pl-3 py-1">
							<p class="text-sm text-text">{note.content}</p>
							<p class="text-xs text-text-muted mt-1">{note.author?.name ?? 'System'} — {formatDate(note.createdAt)}</p>
						</div>
					{/each}
					{#if data.lead.notes.length === 0}
						<p class="text-sm text-text-muted">No notes yet.</p>
					{/if}
				</div>
			</div>

			<!-- Appointments -->
			{#if data.lead.appointments.length > 0}
				<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
					<h3 class="font-heading font-bold text-text mb-3">Appointments</h3>
					<div class="space-y-2">
						{#each data.lead.appointments as appt}
							<div class="flex items-center justify-between text-sm border border-border rounded-lg p-3">
								<div>
									<p class="font-medium text-text">{appt.type} — {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
									{#if appt.vehicle}<p class="text-text-muted text-xs">{appt.vehicle.year} {appt.vehicle.make} {appt.vehicle.model}</p>{/if}
								</div>
								<Badge variant={appt.status === 'CONFIRMED' ? 'success' : 'default'}>{appt.status}</Badge>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Sidebar Actions -->
		<div class="space-y-4">
			<!-- Status -->
			<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
				<h3 class="font-heading font-bold text-text mb-3">Status</h3>
				<form method="POST" action="?/updateStatus" use:enhance>
					<div class="space-y-2">
						{#each statuses as s}
							<button
								type="submit"
								name="status"
								value={s}
								class="w-full text-left px-3 py-2 text-sm rounded-[var(--radius-button)] transition-colors {data.lead.status === s ? 'bg-primary text-white' : 'hover:bg-background text-text'}"
							>
								{s.replace('_', ' ')}
							</button>
						{/each}
					</div>
				</form>
			</div>

			<!-- Assign -->
			<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
				<h3 class="font-heading font-bold text-text mb-3">Assign To</h3>
				<form method="POST" action="?/assign" use:enhance>
					<select
						name="userId"
						onchange={(e) => (e.target as HTMLSelectElement).form?.requestSubmit()}
						class="w-full px-3 py-2 text-sm border border-border rounded-[var(--radius-button)] bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="">Unassigned</option>
						{#each data.users as u}
							<option value={u.id} selected={data.lead.assignedToId === u.id}>{u.name}</option>
						{/each}
					</select>
				</form>
			</div>

			<!-- Timeline -->
			<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
				<h3 class="font-heading font-bold text-text mb-3">Timeline</h3>
				<div class="text-xs text-text-muted space-y-1">
					<p>Created: {formatDate(data.lead.createdAt)}</p>
					<p>Updated: {formatDate(data.lead.updatedAt)}</p>
				</div>
			</div>
		</div>
	</div>
</div>
