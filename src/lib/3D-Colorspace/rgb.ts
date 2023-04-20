import type p5 from 'p5';
import type { Sketch } from 'p5-svelte';
import { puff, download } from '../store';

export const sketchRgbSmoke = (
	width: number,
	height: number,
	rgbSize: number,
	restrictOverlap: boolean
) => {
	const puffContainer = document.getElementById('puff-container');
	if (puffContainer === null) {
		alert('Puff Container is null....');
		return;
	}
	const containerWidth = puffContainer.offsetWidth;
	const containerHeight = puffContainer.offsetHeight;

	const DISPLAY_WIDTH = containerWidth;
	const DISPLAY_HEIGHT = containerHeight;
	const RGB_SIZE = rgbSize;
	const CANVAS_WIDTH = width;
	const CANVAS_HEIGHT = height;
	const CANVAS_ID_LIMIT = CANVAS_WIDTH * CANVAS_HEIGHT;
	const SCALE = DISPLAY_WIDTH / CANVAS_WIDTH;

	const sketch: Sketch = (p5: p5) => {
		let painting: p5.Image;
		p5.disableFriendlyErrors = true;
		const worker = new Worker(new URL('rgb-worker.ts', import.meta.url), {
			/* @vite-ignore */
			name: `${CANVAS_WIDTH}:${CANVAS_HEIGHT}:${RGB_SIZE}:${restrictOverlap}`,
			type: 'module'
		});
		let pixelCount = 0;

		p5.setup = () => {
			// ~~~~~~~~~~~~~~~~~~~~~~~
			// DISPLAY SETUP
			// ~~~~~~~~~~~~~~~~~~~~~~~
			p5.createCanvas(DISPLAY_WIDTH, DISPLAY_HEIGHT);
			p5.noSmooth();
			painting = p5.createImage(CANVAS_WIDTH, CANVAS_HEIGHT);
			painting.loadPixels();

			painting.updatePixels();
			p5.image(painting, 0, 0);
			p5.frameRate(1);

			worker.postMessage('heyyy:3');
			worker.onmessage = function (event) {
				const bufferedPixels = event.data;
				bufferedPixels.forEach((pixel: PixelData) => {
					// painting.set( x, y, p5.color r, g, b  )
					painting.set(pixel[0], pixel[1], p5.color(pixel[2], pixel[3], pixel[4]));
					pixelCount++;
				});
			};
		};

		p5.draw = () => {
			if (pixelCount === CANVAS_ID_LIMIT) {
				p5.noLoop();
				worker.terminate();
				download.set(function () {
					p5.save(painting, 'puff.png');
				});
			}

			// place pixel
			painting.updatePixels();
			p5.scale(SCALE);
			p5.image(painting, 0, 0);
		};
	};

	puff.set(sketch);
};
