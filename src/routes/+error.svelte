<script lang="ts">
  export let error;
  export let status;
</script>

<svelte:head>
  <title>{status} — Lost on the Lot</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6 py-24">
  <div class="text-[5rem] font-heading font-bold text-primary">{status}</div>
  <p class="text-2xl font-heading font-bold text-text mt-4">Oops! You found a car that doesn't exist.</p>
  <p class="text-text-muted mt-2 max-w-xl">
    {error?.message ?? 'The page you were steering toward isn\'t anywhere on our lot.'} 
    Maybe it sputtered off the map, or maybe the GPS is stuck in recalculating mode.
  </p>
  <a href="/" class="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold shadow-sm hover:-translate-y-0.5 transition">
    <span>Back to the showroom</span>
  </a>
  <p class="mt-6 text-sm text-text-light">Need real directions? Call us at <a href="tel:9727678434" class="text-primary font-medium">(972) 767-8434</a>.</p>
</div>
