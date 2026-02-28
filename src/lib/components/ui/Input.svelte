<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		value?: string | number;
	}

	let { label, error, value = $bindable(''), class: className = '', id, ...rest }: Props = $props();

	const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
</script>

<div class="space-y-1.5">
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-text">
			{label}
		</label>
	{/if}
	<input
		{id}
		bind:value
		class="w-full px-4 py-2.5 text-sm border rounded-[var(--radius-input)] bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors {error
			? 'border-error'
			: 'border-border'} {className}"
		{...rest}
	/>
	{#if error}
		<p class="text-sm text-error">{error}</p>
	{/if}
</div>
