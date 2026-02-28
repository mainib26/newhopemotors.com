<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLSelectAttributes {
		label?: string;
		error?: string;
		children: Snippet;
	}

	let { label, error, class: className = '', id, children, ...rest }: Props = $props();

	const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
</script>

<div class="space-y-1.5">
	{#if label}
		<label for={selectId} class="block text-sm font-medium text-text">
			{label}
		</label>
	{/if}
	<select
		id={selectId}
		class="w-full px-4 py-2.5 text-sm border rounded-[var(--radius-input)] bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat pr-10 {error
			? 'border-error'
			: 'border-border'} {className}"
		{...rest}
	>
		{@render children()}
	</select>
	{#if error}
		<p class="text-sm text-error">{error}</p>
	{/if}
</div>
