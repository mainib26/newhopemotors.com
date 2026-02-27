<script lang="ts">
	interface Props {
		user: { name: string; email: string; role: string };
		onToggleSidebar?: () => void;
	}

	let { user, onToggleSidebar }: Props = $props();
</script>

<header class="h-14 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
	<div class="flex items-center gap-3">
		<button onclick={onToggleSidebar} class="p-1.5 rounded-lg hover:bg-background transition-colors text-text-muted" aria-label="Toggle sidebar">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
	</div>

	<div class="flex items-center gap-4">
		<div class="text-right">
			<p class="text-sm font-medium text-text">{user.name}</p>
			<p class="text-xs text-text-muted">{user.role}</p>
		</div>
		<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
			<span class="text-sm font-semibold text-primary">{user.name.charAt(0)}</span>
		</div>
	</div>
</header>
