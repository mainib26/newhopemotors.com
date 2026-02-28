<script lang="ts">
	interface Props {
		features: string[];
	}

	let { features }: Props = $props();
</script>

{#if features.length > 0}
	<div>
		<h2 class="text-lg font-heading font-bold text-text mb-4">Features & Options</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
			{#each features as feature}
				<div class="flex items-center gap-2 text-sm text-text">
					<svg class="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					{feature}
				</div>
			{/each}
		</div>
	</div>
{/if}
