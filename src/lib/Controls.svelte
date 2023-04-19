<script lang="ts">
	import { slide, blur, scale } from 'svelte/transition';
	import { sketchRgbSmoke } from '$lib/3D-Colorspace/rgb';
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

	const clear = () => {
		puff.set(undefined);
	};

	const handleDownload = () => {
		if ($download !== undefined) {
			$download();
		}
	};
</script>

<div class="flex flex-col justify-between bg-primrose min-h-[90vh] p-2 rounded-xl shadow-xl">
	<!-- OPTION GROUP -->
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
	<!-- BUTTON GROUP -->
	<div class="flex flex-col space-y-2">
		{#if $puff === undefined}
			<button
				on:click={generate}
				transition:scale
				class="bg-orchid w-full rounded-md text-white text-xl font-black p-2 shadow-xl"
			>
				Generate
			</button>
		{:else}
			<button
				on:click={clear}
				transition:scale
				class="bg-orchid w-full rounded-md text-white text-xl font-black p-2 shadow-xl"
			>
				Clear
			</button>
		{/if}
		{#if $puff !== undefined}
			<button
				on:click={handleDownload}
				disabled={$download === undefined}
				transition:scale
				class="bg-orchid w-full rounded-md text-white text-xl font-black p-2 shadow-xl"
			>
				Download
			</button>
		{/if}
	</div>
</div>
