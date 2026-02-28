<script lang="ts">
	import { browser } from '$app/environment';
	import Button from '$lib/components/ui/Button.svelte';

	let visible = $state(false);

	if (browser) {
		visible = !localStorage.getItem('cookie-consent');
	}

	function accept() {
		localStorage.setItem('cookie-consent', 'accepted');
		visible = false;
	}

	function decline() {
		localStorage.setItem('cookie-consent', 'declined');
		visible = false;
	}
</script>

{#if visible}
	<div class="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 pr-20 z-50 shadow-lg">
		<div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
			<p class="text-sm text-text-muted text-center sm:text-left">
				We use cookies to improve your experience. By continuing to browse, you agree to our
				<a href="/privacy" class="text-primary hover:underline">Privacy Policy</a>.
			</p>
			<div class="flex gap-3 shrink-0">
				<button onclick={decline} class="px-4 py-1.5 text-sm text-text-muted hover:text-text">Decline</button>
				<Button size="sm" onclick={accept}>Accept</Button>
			</div>
		</div>
	</div>
{/if}
