<script lang="ts">
	let { data } = $props();

	function timeAgo(d: string) {
		const diff = Date.now() - new Date(d).getTime();
		const hrs = Math.floor(diff / 3600000);
		if (hrs < 24) return `${hrs}h ago`;
		return `${Math.floor(hrs / 24)}d ago`;
	}
</script>

<svelte:head><title>Chat Logs — Admin</title></svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-heading font-bold text-text">Chat Logs</h1>

	<div class="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="bg-background border-b border-border text-left">
						<th class="px-4 py-3 font-medium text-text-muted">Session</th>
						<th class="px-4 py-3 font-medium text-text-muted">Lead</th>
						<th class="px-4 py-3 font-medium text-text-muted">Messages</th>
						<th class="px-4 py-3 font-medium text-text-muted text-right">Last Active</th>
					</tr>
				</thead>
				<tbody>
					{#each data.conversations as conv}
						<tr class="border-b border-border/50 hover:bg-background/50">
							<td class="px-4 py-2.5">
								<a href="/admin/chat/{conv.id}" class="font-mono text-xs text-primary hover:underline">{conv.sessionId.slice(0, 12)}...</a>
							</td>
							<td class="px-4 py-2.5 text-text">{conv.leadName ?? '—'}</td>
							<td class="px-4 py-2.5 text-text-muted">{conv.messageCount}</td>
							<td class="px-4 py-2.5 text-text-muted text-right">{timeAgo(conv.createdAt)}</td>
						</tr>
					{/each}
					{#if data.conversations.length === 0}
						<tr><td colspan="4" class="px-4 py-12 text-center text-text-muted">No chat conversations yet</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
