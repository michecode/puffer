<script lang="ts">
	import { scale } from 'svelte/transition';
	import { sketchRgbSmoke } from '$lib/3D-Colorspace/rgb';
	import { puff, download, canvasDimensions } from './store';
	import { SIZE_MAP } from './globals';
	import Icon from './Icon.svelte';

	// GENERATION OPTION STATES
	let sampleMethod = 'Grid';
	let paintingSizeOption = 'md';
	let paintingWidth: number, paintingHeight: number, rgbSize: number;
	let restrictOverlap = true;
	let allowRegen = true;
	let randomColorSeed = true;
	let randomPaintingSeed = true;
	let colorSeedX: number, colorSeedY: number, colorSeedZ: number;
	let paintingSeedX: number, paintingSeedY: number;
	let mode = 'rgb';

	$: $canvasDimensions = [paintingWidth ?? 1, paintingHeight ?? 1];
	$: if (paintingSizeOption !== 'custom') {
		paintingWidth = SIZE_MAP[paintingSizeOption as PaintingPresetSize].canvas;
		paintingHeight = paintingWidth;
		// this isnt required but it will fill the input if the user switches from a preset to a custom which i like
		rgbSize = SIZE_MAP[paintingSizeOption as PaintingPresetSize].rgb;
	}

	const generate = () => {
		let width: number, height: number, rgb: number;
		if (paintingSizeOption === 'custom') {
			width = paintingWidth;
			height = paintingHeight;
			rgb = rgbSize;
		} else {
			width = SIZE_MAP[paintingSizeOption as PaintingPresetSize].canvas;
			height = width;
			rgb = SIZE_MAP[paintingSizeOption as PaintingPresetSize].rgb;
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

		const colorSeed: Coordinates2D | Coordinates3D | undefined = randomColorSeed
			? undefined
			: mode === 'rgb'
			? [colorSeedX, colorSeedY, colorSeedZ]
			: [colorSeedX, colorSeedY];
		const paintingSeed: Coordinates2D | undefined = randomPaintingSeed
			? undefined
			: [paintingSeedX, paintingSeedY];

		if (colorSeed) {
			// if user puts 256, it will clean to 255 automagically!
			colorSeed.forEach((coord, index) => {
				coord === rgb ? (colorSeed[index] = rgb - 1) : null;
			});

			if (colorSeed[0] < 0 || colorSeed[0] > rgb) {
				alert('Custom color seed X value is invalid');
			}
			if (colorSeed[1] < 0 || colorSeed[1] > rgb) {
				alert('Custom color seed Y value is invalid');
			}
			if (colorSeed[1] < 0 || colorSeed[1] > rgb) {
				alert('Custom color seed Z value is invalid');
			}
		}
		if (paintingSeed) {
			paintingSeed[0] === width ? (paintingSeed[0] = width - 1) : null;
			paintingSeed[1] === height ? (paintingSeed[1] = height - 1) : null;

			if (paintingSeed[0] < 0 || paintingSeed[0] > width) {
				alert('Custom painting seed X value is invalid');
			}
			if (paintingSeed[1] < 0 || paintingSeed[1] > height) {
				alert('Custom painting seed Y value is invalid');
			}
		}

		if (mode === 'rgb') {
			sketchRgbSmoke(width, height, rgb, colorSeed, paintingSeed, restrictOverlap, allowRegen);
		}
	};

	const getMinimumRequiredRGB = () => {
		const cubeRoot = Math.cbrt(paintingWidth * paintingHeight);
		const minRgbRoot = Math.floor(cubeRoot) + 1;
		rgbSize = minRgbRoot >= 256 ? 256 : minRgbRoot;
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
	class="flex flex-col justify-between bg-primrose min-h-[90vh] w-full lg:basis-64 p-2 rounded-xl shadow-xl"
>
	<!-- OPTION GROUP -->
	<div class="flex flex-col space-y-2">
		<!-- Header -->
		<div class="flex justify-between">
			<h1 class="font-black">Options</h1>
			<a href="/docs" target="_blank" rel="noreferrer">
				<Icon type="question" width="24px" height="24px" />
			</a>
		</div>

		<!-- Options -->
		<div>
			<div class="mb-2">
				<label>
					Color Sample Method<br />
					<label>
						<input
							type="radio"
							name="sample-method"
							value="Grid"
							bind:group={sampleMethod}
							disabled={true}
						/>
						Grid
					</label>
					<label>
						<input
							type="radio"
							name="sample-method"
							value="RM"
							bind:group={sampleMethod}
							disabled={true}
						/>
						RM
					</label>
				</label>
			</div>
			<div class="mb-2">
				<label>
					Canvas Size<br />
					<select name="canvas size" bind:value={paintingSizeOption}>
						<option value="nano">8x8</option>
						<option value="xs">64x64</option>
						<option value="sm">125x125</option>
						<option value="md">512x512</option>
						<option value="lg">1000x1000</option>
						<option value="xl">4096x4096</option>
						<option value="custom">custom</option>
					</select>
				</label>
			</div>
			{#if paintingSizeOption === 'custom'}
				<div class="flex flex-col">
					<div class="flex space-x-2">
						<label>
							Width
							<br />
							<input type="number" placeholder="1920" bind:value={paintingWidth} class="w-20" />
						</label>
						<label>
							Height
							<br />
							<input type="number" placeholder="1080" bind:value={paintingHeight} class="w-20" />
						</label>
						<label>
							RGB<br />
							<input type="number" placeholder="256" bind:value={rgbSize} class="w-12" />
						</label>
					</div>
					<button class="bg-orchid p-1 rounded-md mt-2 text-sm" on:click={getMinimumRequiredRGB}>
						get minimum rgb root
					</button>
				</div>
			{/if}
		</div>

		<!-- Flags -->
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
			<label>
				<input type="checkbox" bind:checked={randomColorSeed} />
				Random Color Seed
			</label>
			{#if !randomColorSeed}
				<label class="text-sm">
					Color coordinates
					<div class="flex space-x-2">
						<input type="number" bind:value={colorSeedX} placeholder="X" class="w-12" />
						<input type="number" bind:value={colorSeedY} placeholder="Y" class="w-12" />
						{#if mode === 'rgb'}
							<input type="number" bind:value={colorSeedZ} placeholder="Z" class="w-12" />
						{/if}
					</div>
				</label>
			{/if}
			<label>
				<input type="checkbox" bind:checked={randomPaintingSeed} />
				Random Position Seed
			</label>
			{#if !randomPaintingSeed}
				<label class="text-sm">
					Painting coordinates
					<div class="flex space-x-2">
						<input type="number" bind:value={paintingSeedX} placeholder="X" class="w-16" />
						<input type="number" bind:value={paintingSeedY} placeholder="Y" class="w-16" />
					</div>
				</label>
			{/if}
		</div>
	</div>
	<!-- Action Buttons -->
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
