<!-- 
	@FUTURE MADDY IF UR CONFUSED
	Container refers to the raw space available between the bounds of the view port and like idk the control bar
	Puff Container is formatted to the aspect ratio of the painting and then maximized to fit inside of the container.default

	x and y are the painting dimensions

	Space Element refers to the container
 -->
<script lang="ts">
	import { onMount } from 'svelte';
	import P5 from 'p5-svelte';
	import { puff, canvasDimensions } from '../lib/store';

	let x: number, y: number, spaceEl: HTMLElement | null, puffContainerEl: HTMLElement | null;
	$: [x, y] = $canvasDimensions;
	$: resizeCanvas(x, y);

	// params are just so I can subscribe basically.
	const resizeCanvas = (x: number, y: number) => {
		let containerX = spaceEl?.offsetWidth as number;
		let containerY = spaceEl?.offsetHeight as number;

		const aspectRatio = x / y;
		let canvasX, canvasY;
		if (aspectRatio > 1) {
			canvasX = containerX;
			canvasY = containerX * (y / x);
		} else if (aspectRatio === 1) {
			// for mobile. if desktop then the height is smaller, if mobile then the width is smaller.
			canvasX = containerX > containerY ? containerY : containerX;
			canvasY = canvasX;
		} else {
			canvasY = containerY;
			canvasX = containerY * (x / y);
		}

		if (puffContainerEl) {
			puffContainerEl.style.width = canvasX + 'px';
			puffContainerEl.style.height = canvasY + 'px';
		}
	};

	onMount(() => {
		spaceEl = document.getElementById('space');
		puffContainerEl = document.getElementById('puff-container');

		// To prevent showing a null box before user input
		const [x, y] = $canvasDimensions;
		resizeCanvas(x, y);
	});
</script>

<div id="space" class="flex w-4/5 h-[90vh]">
	<!-- im doing an offset because it doesnt line up perfectly lol -->
	<div id="puff-container" class="outline outline-offset-2 shadow-2xl m-auto">
		{#if $puff}
			<P5 sketch={$puff} />
		{:else}
			<div class="bg-orchid w-full h-full" />
		{/if}
	</div>
</div>
