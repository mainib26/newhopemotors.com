<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Admin Login — New Hope Motors</title>
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-heading font-bold text-primary">New Hope Motors</h1>
			<p class="text-sm text-text-muted mt-1">Admin Panel</p>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update();
				};
			}}
			class="bg-surface border border-border rounded-[var(--radius-card)] p-6 space-y-4"
		>
			<h2 class="text-lg font-heading font-bold text-text">Sign In</h2>

			{#if form?.error}
				<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">
					{form.error}
				</div>
			{/if}

			<Input
				label="Email"
				name="email"
				type="email"
				value={form?.email ?? ''}
				placeholder="you@newhopemotors.com"
				required
			/>

			<Input
				label="Password"
				name="password"
				type="password"
				placeholder="Enter your password"
				required
			/>

			<Button type="submit" fullWidth disabled={submitting}>
				{submitting ? 'Signing in...' : 'Sign In'}
			</Button>
		</form>

		<p class="text-center text-xs text-text-light mt-6">
			<a href="/" class="hover:text-primary">← Back to website</a>
		</p>
	</div>
</div>
