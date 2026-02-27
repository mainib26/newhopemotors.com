<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
</script>

<svelte:head><title>Edit Page — Admin</title></svelte:head>

<div class="max-w-3xl space-y-6">
	<div class="flex items-center gap-3">
		<a href="/admin/pages" class="text-text-muted hover:text-text">← Pages</a>
		<h1 class="text-2xl font-heading font-bold text-text">Edit Page</h1>
	</div>

	{#if form?.success}
		<div class="p-3 bg-green-50 border border-green-200 rounded-[var(--radius-button)] text-sm text-green-700">Page updated.</div>
	{/if}

	<form method="POST" use:enhance={() => {
		submitting = true;
		return async ({ update }) => { submitting = false; await update({ reset: false }); };
	}} class="space-y-6">
		<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
			<Input label="Title" name="title" value={data.page.title} required />
			<div class="space-y-1.5">
				<label for="content" class="block text-sm font-medium text-text">Content (HTML)</label>
				<textarea
					id="content"
					name="content"
					rows="16"
					class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text font-mono placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary resize-y"
				>{data.page.content}</textarea>
			</div>
			<label class="flex items-center gap-2 text-sm text-text">
				<input type="checkbox" name="published" checked={data.page.published} class="rounded" />
				Published
			</label>
		</div>

		<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
			<h3 class="font-heading font-bold text-text">SEO</h3>
			<Input label="Meta Title" name="metaTitle" value={data.page.metaTitle ?? ''} placeholder="Override page title for search engines" />
			<div class="space-y-1.5">
				<label for="metaDesc" class="block text-sm font-medium text-text">Meta Description</label>
				<textarea
					id="metaDesc"
					name="metaDescription"
					rows="2"
					class="w-full px-4 py-2.5 text-sm border border-border rounded-[var(--radius-input)] bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary resize-none"
					placeholder="Brief description for search results"
				>{data.page.metaDescription ?? ''}</textarea>
			</div>
		</div>

		<div class="flex justify-end gap-3">
			<Button href="/admin/pages" variant="secondary">Cancel</Button>
			<Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Page'}</Button>
		</div>
	</form>
</div>
