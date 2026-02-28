<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		fullWidth?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		href,
		fullWidth = false,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses = {
		primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
		secondary: 'bg-surface text-text border border-border hover:bg-cream focus:ring-primary',
		accent: 'bg-accent text-white hover:bg-accent-dark focus:ring-accent',
		ghost: 'bg-transparent text-text hover:bg-cream focus:ring-primary',
		danger: 'bg-error text-white hover:bg-red-700 focus:ring-error'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-button)]',
		md: 'px-5 py-2.5 text-sm rounded-[var(--radius-button)]',
		lg: 'px-7 py-3.5 text-base rounded-[var(--radius-button)]'
	};

	const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
</script>

{#if href}
	<a {href} class={classes}>
		{@render children()}
	</a>
{:else}
	<button class={classes} {...rest}>
		{@render children()}
	</button>
{/if}
