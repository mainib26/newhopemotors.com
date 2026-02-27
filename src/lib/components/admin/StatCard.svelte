<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
		change?: string;
		icon?: string;
	}

	let { label, value, change, icon }: Props = $props();
</script>

<div class="bg-surface border border-border rounded-[var(--radius-card)] p-5">
	<div class="flex items-start justify-between">
		<div>
			<p class="text-sm text-text-muted">{label}</p>
			<p class="text-2xl font-heading font-bold text-text mt-1">{value}</p>
			{#if change}
				<p class="text-xs mt-1 {change.startsWith('+') ? 'text-green-600' : 'text-red-500'}">{change} from last month</p>
			{/if}
		</div>
		{#if icon}
			<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
				<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icon} />
				</svg>
			</div>
		{/if}
	</div>
</div>
