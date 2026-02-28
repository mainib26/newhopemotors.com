<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
</script>

<svelte:head><title>Settings — Admin</title></svelte:head>

<div class="space-y-8 max-w-3xl">
	<h1 class="text-2xl font-heading font-bold text-text">Settings</h1>

	<!-- Dealership Info -->
	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
		<h3 class="font-heading font-bold text-text">Dealership Info</h3>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
			<div>
				<span class="text-text-muted">Name</span>
				<p class="font-medium text-text">New Hope Motors</p>
			</div>
			<div>
				<span class="text-text-muted">Phone</span>
				<p class="font-medium text-text">(972) 767-8434</p>
			</div>
			<div>
				<span class="text-text-muted">Address</span>
				<p class="font-medium text-text">3343 FM 1827, McKinney, TX 75071</p>
			</div>
			<div>
				<span class="text-text-muted">Hours</span>
				<p class="font-medium text-text">Mon-Fri 9-7, Sat 9-6, Sun Closed</p>
			</div>
		</div>
	</div>

	<!-- User Management -->
	{#if data.isAdmin}
		<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
			<h3 class="font-heading font-bold text-text">User Management</h3>

			{#if form?.userCreated}
				<div class="p-3 bg-green-50 border border-green-200 rounded-[var(--radius-button)] text-sm text-green-700">User created.</div>
			{/if}
			{#if form?.userError}
				<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">{form.userError}</div>
			{/if}

			<!-- Existing Users -->
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="pb-2 font-medium text-text-muted">Name</th>
						<th class="pb-2 font-medium text-text-muted">Email</th>
						<th class="pb-2 font-medium text-text-muted">Role</th>
						<th class="pb-2 font-medium text-text-muted">Status</th>
						<th class="pb-2"></th>
					</tr>
				</thead>
				<tbody>
					{#each data.users as user}
						<tr class="border-b border-border/50">
							<td class="py-2 text-text">{user.name}</td>
							<td class="py-2 text-text-muted">{user.email}</td>
							<td class="py-2"><Badge variant={user.role === 'ADMIN' ? 'primary' : 'default'}>{user.role}</Badge></td>
							<td class="py-2"><Badge variant={user.isActive ? 'success' : 'default'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
							<td class="py-2">
								<form method="POST" action="?/toggleUser" use:enhance>
									<input type="hidden" name="userId" value={user.id} />
									<input type="hidden" name="isActive" value={user.isActive ? 'false' : 'true'} />
									<button type="submit" class="text-xs text-primary hover:underline">
										{user.isActive ? 'Deactivate' : 'Activate'}
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<!-- Create User -->
			<div class="pt-4 border-t border-border">
				<h4 class="text-sm font-medium text-text mb-3">Add User</h4>
				<form method="POST" action="?/createUser" use:enhance class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Input label="Name" name="name" required placeholder="Full name" />
					<Input label="Email" name="email" type="email" required placeholder="user@newhopemotors.com" />
					<Input label="Password" name="password" type="password" required placeholder="Min 8 characters" />
					<div class="space-y-1.5">
						<label for="role" class="block text-sm font-medium text-text">Role</label>
						<select id="role" name="role" class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text">
							<option value="VIEWER">Viewer</option>
							<option value="SALES">Sales</option>
							<option value="ADMIN">Admin</option>
						</select>
					</div>
					<div class="sm:col-span-2">
						<Button type="submit">Create User</Button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
