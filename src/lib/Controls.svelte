<script lang="ts">
	import { scale } from 'svelte/transition';
	import { sketchRgbSmoke } from '$lib/3D-Colorspace/rgb';
	import { puff, download, canvasDimensions } from '../lib/store';
	import { SIZE_MAP } from './globals';

	// GENERATION OPTION STATES
	let canvasOption = 'custom';
	let canvasWidth: number, canvasHeight: number, rgbSize: number;
	let restrictOverlap = true;
	let allowRegen = true;
	let mode = 'rgb';

	$: $canvasDimensions = [canvasWidth ?? 1, canvasHeight ?? 1];

	const generate = () => {
		let width: number, height: number, rgb: number;
		if (canvasOption === 'custom') {
			width = canvasWidth;
			height = canvasHeight;
			rgb = rgbSize;
		} else {
			width = SIZE_MAP[canvasOption as CanvasSize].canvas;
			height = width;
			rgb = SIZE_MAP[canvasOption as CanvasSize].rgb;
		}

		if (!width || width < 1) {
			alert('Invalid Canvas Width');
			return;
		}
		if (!height || height < 1) {
			alert('Invalid Canvas Height');
			return;
		}
		if (!rgb || rgb < 2 || rgb > 256) {
			alert('Invalid RGB Size');
			return;
		}

		if (mode === 'rgb') {
			console.log(width, height, rgb);
			sketchRgbSmoke(width, height, rgb, restrictOverlap, allowRegen);
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

<div
	class="fixed right-8 flex flex-col justify-between bg-primrose min-h-[90vh] w-full lg:w-fit p-2 rounded-xl shadow-xl"
>
	<!-- OPTION GROUP -->
	<div class="flex flex-col space-y-2">
		<h1 class="font-black">Options</h1>
		<div>
			<label>
				Canvas Size<br />
				<select name="canvas size" bind:value={canvasOption}>
					<option value="nano">8x8</option>
					<option value="xs">64x64</option>
					<option value="sm">125x125</option>
					<option value="md">512x512</option>
					<option value="lg">1000x1000</option>
					<option value="xl">4096x4096</option>
					<option value="custom">custom</option>
				</select>
			</label>
			{#if canvasOption === 'custom'}
				<div class="flex flex-col">
					<label>
						Width
						<br />
						<input type="number" placeholder="1920" bind:value={canvasWidth} />
					</label>
					<label>
						Height
						<br />
						<input type="number" placeholder="1080" bind:value={canvasHeight} />
					</label>
					<label>
						RGB Root Size (2-256)<br />
						<input type="number" placeholder="256" bind:value={rgbSize} />
					</label>
				</div>
			{/if}
		</div>

		<div class="flex flex-col">
			<h6>Flags</h6>
			<label>
				<input type="checkbox" bind:checked={restrictOverlap} />
				Restrict Overlap
			</label>
			<label>
				<input type="checkbox" bind:checked={allowRegen} />
				Allow KD-Tree Regen
			</label>
		</div>
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
