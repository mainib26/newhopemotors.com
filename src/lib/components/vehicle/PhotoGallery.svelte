<script lang="ts">
	interface Photo {
		id: string;
		url: string;
		alt: string | null;
		isPrimary: boolean;
	}

	interface Props {
		photos: Photo[];
		vehicleName: string;
	}

	let { photos, vehicleName }: Props = $props();

	let selectedIndex = $state(0);
	let lightboxOpen = $state(false);

	function selectPhoto(index: number) {
		selectedIndex = index;
	}

	function openLightbox() {
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function nextPhoto() {
		selectedIndex = (selectedIndex + 1) % photos.length;
	}

	function prevPhoto() {
		selectedIndex = (selectedIndex - 1 + photos.length) % photos.length;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowRight') nextPhoto();
		if (e.key === 'ArrowLeft') prevPhoto();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="space-y-3">
	<!-- Main Image -->
	<button
		onclick={openLightbox}
		class="relative w-full aspect-[4/3] bg-cream rounded-[var(--radius-card)] overflow-hidden cursor-zoom-in group"
	>
		{#if photos.length > 0}
			<img
				src={photos[selectedIndex].url}
				alt={photos[selectedIndex].alt || vehicleName}
				class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
			/>
		{:else}
			<div class="w-full h-full flex items-center justify-center text-text-light">
				<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
		{/if}

		{#if photos.length > 1}
			<div class="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
				{selectedIndex + 1} / {photos.length}
			</div>
		{/if}
	</button>

	<!-- Thumbnails -->
	{#if photos.length > 1}
		<div class="flex gap-2 overflow-x-auto pb-1">
			{#each photos as photo, i}
				<button
					onclick={() => selectPhoto(i)}
					class="shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors {i === selectedIndex
						? 'border-primary'
						: 'border-transparent hover:border-border'}"
				>
					<img
						src={photo.url}
						alt={photo.alt || `Photo ${i + 1}`}
						class="w-full h-full object-cover"
						loading="lazy"
					/>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Lightbox -->
{#if lightboxOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
		onclick={closeLightbox}
		role="dialog"
		aria-modal="true"
		aria-label="Photo gallery"
	>
		<button
			onclick={(e) => { e.stopPropagation(); closeLightbox(); }}
			class="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10"
			aria-label="Close"
		>
			<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		{#if photos.length > 1}
			<button
				onclick={(e) => { e.stopPropagation(); prevPhoto(); }}
				class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
				aria-label="Previous photo"
			>
				<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<button
				onclick={(e) => { e.stopPropagation(); nextPhoto(); }}
				class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
				aria-label="Next photo"
			>
				<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div onclick={(e) => e.stopPropagation()} class="max-w-5xl max-h-[85vh] mx-4">
			<img
				src={photos[selectedIndex].url}
				alt={photos[selectedIndex].alt || vehicleName}
				class="max-w-full max-h-[85vh] object-contain"
			/>
		</div>

		<div class="absolute bottom-4 text-white/60 text-sm">
			{selectedIndex + 1} / {photos.length}
		</div>
	</div>
{/if}
