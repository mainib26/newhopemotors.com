<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
</script>

<svelte:head>
	<title>Reset Password — New Hope Motors</title>
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-heading font-bold text-primary">New Hope Motors</h1>
			<p class="text-sm text-text-muted mt-1">Admin Panel</p>
		</div>

		<div class="bg-surface border border-border rounded-[var(--radius-card)] p-6 space-y-4">
			{#if !data.hasSession}
				<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">
					Invalid or expired reset link. Please request a new one.
				</div>
				<a href="/admin/login" class="text-sm text-primary hover:underline">Back to login</a>
			{:else}
				<h2 class="text-lg font-heading font-bold text-text">Set New Password</h2>

				{#if form?.error}
					<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">
						{form.error}
					</div>
				{/if}

				<form
					method="POST"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							submitting = false;
							await update();
						};
					}}
					class="space-y-4"
				>
					<Input
						label="New Password"
						name="password"
						type="password"
						bind:value={password}
						placeholder="At least 8 characters"
						required
					/>

					<Input
						label="Confirm Password"
						name="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						placeholder="Confirm your password"
						required
					/>

					<Button type="submit" fullWidth disabled={submitting}>
						{submitting ? 'Updating...' : 'Update Password'}
					</Button>
				</form>
			{/if}
		</div>

		<p class="text-center text-xs text-text-light mt-6">
			<a href="/admin/login" class="hover:text-primary">Back to login</a>
		</p>
	</div>
</div>
