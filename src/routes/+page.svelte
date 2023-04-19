<script lang="ts">
	import { sketchRgbSmoke } from '$lib/3D-Colorspace/rgb';
	import Header from '$lib/Header.svelte';
	import P5, { type Sketch } from 'p5-svelte';
	import { puff, download } from '../lib/store';

	// GENERATION OPTION STATES
	let canvasSize = 'md' as CanvasSize;
	let restrictOverlap = true;
	let mode = 'rgb';

	const generate = () => {
		if (mode === 'rgb') {
			sketchRgbSmoke(canvasSize, restrictOverlap);
		}
	};

	const handleDownload = () => {
		if ($download !== undefined) {
			$download();
		}
	};
</script>

<Header />
<div class="flex flex-col w-fit mx-auto">
	{#if $puff}
		<P5 sketch={$puff} />
	{:else}
		<div class="w-[512px] h-[512px] bg-orchid" />
	{/if}
	<div>
		<select name="canvas size" bind:value={canvasSize}>
			<option value="nano">8x8</option>
			<option value="xs">64x64</option>
			<option value="sm">125x125</option>
			<option value="md">512x512</option>
			<option value="lg">1000x1000</option>
			<option value="xl">4096x4096</option>
			<option value="custom" disabled>custom</option>
		</select>
		<label>
			<input type="checkbox" bind:checked={restrictOverlap} />
			Restrict Overlap
		</label>
	</div>
	<div>
		<button on:click={generate}>generate</button>
		<button on:click={handleDownload} disabled={$download === undefined}>download</button>
	</div>
</div>
<!-- <P5 sketch={rgbColorSpace} /> -->
