<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createClient } from '@supabase/supabase-js';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data } = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let success = $state(false);
	let submitting = $state(false);
	let ready = $state(false);

	let supabase: ReturnType<typeof createClient> | null = null;

	onMount(async () => {
		const accessToken = $page.url.searchParams.get('access_token');
		const refreshToken = $page.url.searchParams.get('refresh_token');

		if (!accessToken || !refreshToken) {
			error = 'Invalid or expired reset link. Please request a new one.';
			return;
		}

		supabase = createClient(data.supabaseUrl, data.supabaseAnonKey);

		const { error: sessionError } = await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});

		if (sessionError) {
			error = 'This reset link has expired. Please request a new one.';
			return;
		}

		ready = true;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (password.length < 8) {
			error = 'Password must be at least 8 characters.';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		if (!supabase) return;

		submitting = true;

		const { error: updateError } = await supabase.auth.updateUser({ password });

		submitting = false;

		if (updateError) {
			error = updateError.message;
			return;
		}

		success = true;
		setTimeout(() => goto('/admin/login'), 2000);
	}
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
			{#if success}
				<div class="p-3 bg-green-50 border border-green-200 rounded-[var(--radius-button)] text-sm text-green-700">
					Password updated successfully! Redirecting to login...
				</div>
			{:else if !ready && error}
				<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">
					{error}
				</div>
				<a href="/admin/login" class="text-sm text-primary hover:underline">Back to login</a>
			{:else if ready}
				<h2 class="text-lg font-heading font-bold text-text">Set New Password</h2>

				{#if error}
					<div class="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-button)] text-sm text-red-700">
						{error}
					</div>
				{/if}

				<form onsubmit={handleSubmit} class="space-y-4">
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
			{:else}
				<p class="text-sm text-text-muted text-center">Verifying reset link...</p>
			{/if}
		</div>

		<p class="text-center text-xs text-text-light mt-6">
			<a href="/admin/login" class="hover:text-primary">Back to login</a>
		</p>
	</div>
</div>
