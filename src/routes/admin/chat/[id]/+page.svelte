<script lang="ts">
	let { data } = $props();

	function formatTime(d: string) {
		return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}
</script>

<svelte:head><title>Chat Transcript — Admin</title></svelte:head>

<div class="space-y-6 max-w-3xl">
	<div class="flex items-center gap-3">
		<a href="/admin/chat" class="text-text-muted hover:text-text">← Chat Logs</a>
		<h1 class="text-2xl font-heading font-bold text-text">Chat Transcript</h1>
	</div>

	<div class="text-sm text-text-muted">
		Session: <span class="font-mono">{data.conversation.sessionId}</span>
		{#if data.conversation.leadName}
			· Linked to: <a href="/admin/leads/{data.conversation.leadId}" class="text-primary hover:underline">{data.conversation.leadName}</a>
		{/if}
	</div>

	<div class="bg-surface border border-border rounded-[var(--radius-card)] p-4 space-y-4">
		{#each data.conversation.messages as msg}
			<div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
				<div class="max-w-[80%] {msg.role === 'user' ? 'bg-primary text-white' : 'bg-background text-text'} rounded-lg px-4 py-2.5">
					<p class="text-sm whitespace-pre-wrap">{msg.content}</p>
					<p class="text-[10px] mt-1 {msg.role === 'user' ? 'text-white/60' : 'text-text-muted'}">{formatTime(msg.createdAt)}</p>
				</div>
			</div>
		{/each}
		{#if data.conversation.messages.length === 0}
			<p class="text-center text-text-muted text-sm py-8">No messages in this conversation.</p>
		{/if}
	</div>
</div>
