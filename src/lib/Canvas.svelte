<script lang="ts">
	import P5 from 'p5-svelte';
	import { puff } from '../lib/store';
</script>

<div class="flex w-4/5">
	<div class="border-black border-2 shadow-2xl mx-auto">
		{#if $puff}
			<P5 sketch={$puff} />
		{:else}
			<div class="w-[512px] h-[512px] bg-orchid" />
		{/if}
	</div>
</div>
