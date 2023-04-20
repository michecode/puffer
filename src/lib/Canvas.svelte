<script lang="ts">
	import P5 from 'p5-svelte';
	import { puff } from '../lib/store';
</script>

<div class="flex w-4/5 h-[90vh]">
	<!-- im doing an offset because it doesnt line up perfectly lol -->
	<div id="puff-container" class="aspect-square outline outline-offset-2 shadow-2xl mx-auto">
		{#if $puff}
			<P5 sketch={$puff} />
		{:else}
			<div class="bg-orchid w-full h-full" />
		{/if}
	</div>
</div>
