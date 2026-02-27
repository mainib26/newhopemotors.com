<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	interface Props {
		currentPage: number;
		totalPages: number;
	}

	let { currentPage, totalPages }: Props = $props();

	function goToPage(p: number) {
		const params = new URLSearchParams($page.url.searchParams);
		if (p <= 1) {
			params.delete('page');
		} else {
			params.set('page', String(p));
		}
		goto(`/inventory?${params.toString()}`);
	}

	let pages = $derived(() => {
		const result: (number | '...')[] = [];
		const delta = 2;
		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
				result.push(i);
			} else if (result[result.length - 1] !== '...') {
				result.push('...');
			}
		}
		return result;
	});
</script>

{#if totalPages > 1}
	<nav class="flex items-center justify-center gap-1 py-8" aria-label="Pagination">
		<button
			onclick={() => goToPage(currentPage - 1)}
			disabled={currentPage <= 1}
			class="px-3 py-2 text-sm rounded-[var(--radius-button)] border border-border hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			Previous
		</button>

		{#each pages() as p}
			{#if p === '...'}
				<span class="px-2 text-text-muted">...</span>
			{:else}
				<button
					onclick={() => goToPage(p as number)}
					class="w-10 h-10 text-sm rounded-[var(--radius-button)] transition-colors {p === currentPage
						? 'bg-primary text-white'
						: 'border border-border hover:bg-cream'}"
				>
					{p}
				</button>
			{/if}
		{/each}

		<button
			onclick={() => goToPage(currentPage + 1)}
			disabled={currentPage >= totalPages}
			class="px-3 py-2 text-sm rounded-[var(--radius-button)] border border-border hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			Next
		</button>
	</nav>
{/if}
