<script lang="ts">
	import { browser } from '$app/environment';

	let open = $state(false);
	let messages = $state<Array<{ role: string; content: string }>>([]);
	let input = $state('');
	let sending = $state(false);
	let sessionId = $state(crypto.randomUUID());
	let messagesEl: HTMLDivElement;
	let cookieBannerVisible = $state(browser ? !localStorage.getItem('cookie-consent') : false);

	// Watch for cookie consent changes (from the CookieConsent component)
	if (browser) {
		const origSetItem = localStorage.setItem.bind(localStorage);
		localStorage.setItem = (key: string, value: string) => {
			origSetItem(key, value);
			if (key === 'cookie-consent') cookieBannerVisible = false;
		};
	}

	let bottomClass = $derived(cookieBannerVisible ? 'bottom-20' : 'bottom-6');
	let onDarkBg = $state(false);
	let chatBtnEl: HTMLButtonElement;

	function getLuminance(r: number, g: number, b: number): number {
		const [rs, gs, bs] = [r, g, b].map(c => {
			c /= 255;
			return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
	}

	function parseBgColor(color: string): [number, number, number, number] | null {
		const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
		if (!match) return null;
		return [+match[1], +match[2], +match[3], match[4] !== undefined ? +match[4] : 1];
	}

	function checkBackground() {
		if (!chatBtnEl || open) return;
		const rect = chatBtnEl.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;

		// Temporarily hide the button so elementFromPoint hits what's behind it
		chatBtnEl.style.pointerEvents = 'none';
		chatBtnEl.style.visibility = 'hidden';
		const el = document.elementFromPoint(cx, cy);
		chatBtnEl.style.pointerEvents = '';
		chatBtnEl.style.visibility = '';

		if (!el) return;

		// Walk up the DOM to find the first non-transparent background
		let node: Element | null = el;
		while (node && node !== document.documentElement) {
			const bg = getComputedStyle(node).backgroundColor;
			const parsed = parseBgColor(bg);
			if (parsed && parsed[3] > 0.1) {
				onDarkBg = getLuminance(parsed[0], parsed[1], parsed[2]) < 0.4;
				return;
			}
			node = node.parentElement;
		}
		onDarkBg = false;
	}

	if (browser) {
		// Check on scroll and resize
		const throttledCheck = () => requestAnimationFrame(checkBackground);
		window.addEventListener('scroll', throttledCheck, { passive: true });
		window.addEventListener('resize', throttledCheck, { passive: true });
		// Initial check after mount
		setTimeout(checkBackground, 100);
	}

	const quickReplies = [
		'Browse Inventory',
		'Schedule Test Drive',
		'Financing Options',
		"Talk to Daniel's Team"
	];

	async function send(text?: string) {
		const content = text ?? input.trim();
		if (!content || sending) return;

		input = '';
		messages = [...messages, { role: 'user', content }];
		sending = true;

		scrollToBottom();

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages, sessionId })
			});
			const data = await res.json();
			messages = [...messages, { role: 'assistant', content: data.response }];
		} catch {
			messages = [...messages, { role: 'assistant', content: "Sorry, something went wrong. Please call us at (972) 767-8434!" }];
		} finally {
			sending = false;
			scrollToBottom();
		}
	}

	function scrollToBottom() {
		requestAnimationFrame(() => {
			if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<!-- Floating Button -->
{#if !open}
	<button
		bind:this={chatBtnEl}
		onclick={() => open = true}
		class="fixed {bottomClass} right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-50 {onDarkBg ? 'bg-white text-primary hover:bg-white/90' : 'bg-primary text-white hover:bg-primary/90'}"
		aria-label="Open chat"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
		</svg>
	</button>
{/if}

<!-- Chat Panel -->
{#if open}
	<div class="fixed {bottomClass} right-6 w-[360px] h-[520px] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
		<!-- Header -->
		<div class="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
					<span class="text-sm">🚗</span>
				</div>
				<div>
					<p class="text-white font-semibold text-sm">Hope</p>
					<p class="text-white/60 text-xs">New Hope Motors</p>
				</div>
			</div>
			<button onclick={() => open = false} class="text-white/70 hover:text-white" aria-label="Close chat">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Messages -->
		<div bind:this={messagesEl} class="flex-1 overflow-y-auto p-4 space-y-3">
			{#if messages.length === 0}
				<!-- Welcome -->
				<div class="bg-background rounded-lg px-3 py-2.5">
					<p class="text-sm text-text">Hi! I'm Hope, your virtual assistant at New Hope Motors. How can I help you today?</p>
				</div>
				<!-- Quick Replies -->
				<div class="flex flex-wrap gap-2">
					{#each quickReplies as reply}
						<button
							onclick={() => send(reply)}
							class="px-3 py-1.5 text-xs border border-primary text-primary rounded-full hover:bg-primary/10 transition-colors"
						>
							{reply}
						</button>
					{/each}
				</div>
			{/if}

			{#each messages as msg}
				<div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="max-w-[85%] {msg.role === 'user' ? 'bg-primary text-white' : 'bg-background text-text'} rounded-lg px-3 py-2">
						<p class="text-sm whitespace-pre-wrap">{msg.content}</p>
					</div>
				</div>
			{/each}

			{#if sending}
				<div class="flex justify-start">
					<div class="bg-background rounded-lg px-3 py-2">
						<div class="flex gap-1">
							<span class="w-2 h-2 bg-text-muted rounded-full animate-bounce" style="animation-delay: 0ms"></span>
							<span class="w-2 h-2 bg-text-muted rounded-full animate-bounce" style="animation-delay: 150ms"></span>
							<span class="w-2 h-2 bg-text-muted rounded-full animate-bounce" style="animation-delay: 300ms"></span>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Input -->
		<div class="border-t border-border p-3 shrink-0">
			<div class="flex gap-2">
				<input
					bind:value={input}
					onkeydown={handleKeydown}
					placeholder="Type a message..."
					disabled={sending}
					class="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				<button
					onclick={() => send()}
					disabled={!input.trim() || sending}
					class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}
