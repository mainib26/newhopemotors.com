<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error';
		size?: 'sm' | 'md';
		children: Snippet;
	}

	let { variant = 'default', size = 'sm', children }: Props = $props();

	const variantClasses = {
		default: 'bg-cream text-text-muted',
		primary: 'bg-primary/10 text-primary',
		accent: 'bg-accent/10 text-accent-dark',
		success: 'bg-green-50 text-green-700',
		warning: 'bg-amber-50 text-amber-700',
		error: 'bg-red-50 text-red-700'
	};

	const sizeClasses = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-3 py-1 text-sm'
	};
</script>

<span class="inline-flex items-center font-medium rounded-full {variantClasses[variant]} {sizeClasses[size]}">
	{@render children()}
</span>
