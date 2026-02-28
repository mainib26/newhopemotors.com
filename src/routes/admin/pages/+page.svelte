<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<svelte:head><title>Pages — Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-heading font-bold text-text">Pages</h1>
	</div>

	<div class="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden">
		<table class="w-full text-sm">
			<thead>
				<tr class="bg-background border-b border-border text-left">
					<th class="px-4 py-3 font-medium text-text-muted">Title</th>
					<th class="px-4 py-3 font-medium text-text-muted">Slug</th>
					<th class="px-4 py-3 font-medium text-text-muted">Status</th>
					<th class="px-4 py-3 font-medium text-text-muted">Updated</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.pages as page}
					<tr class="border-b border-border/50 hover:bg-background/50">
						<td class="px-4 py-2.5 font-medium text-text">{page.title}</td>
						<td class="px-4 py-2.5 text-text-muted font-mono text-xs">/{page.slug}</td>
						<td class="px-4 py-2.5">
							<Badge variant={page.published ? 'success' : 'default'}>{page.published ? 'Published' : 'Draft'}</Badge>
						</td>
						<td class="px-4 py-2.5 text-text-muted">{formatDate(page.updatedAt)}</td>
						<td class="px-4 py-2.5"><a href="/admin/pages/{page.id}" class="text-sm text-primary hover:underline">Edit</a></td>
					</tr>
				{/each}
				{#if data.pages.length === 0}
					<tr><td colspan="5" class="px-4 py-12 text-center text-text-muted">No pages yet</td></tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
