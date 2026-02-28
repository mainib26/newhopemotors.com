<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		hover?: boolean;
		padding?: boolean;
		children: Snippet;
	}

	let { class: className = '', hover = false, padding = true, children }: Props = $props();
</script>

<div
	class="bg-surface border border-border rounded-[var(--radius-card)] {hover
		? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'
		: ''} {padding ? 'p-6' : ''} {className}"
>
	{@render children()}
</div>
