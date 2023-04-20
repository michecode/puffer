import type p5 from 'p5';
import type { Sketch } from 'p5-svelte';
import { puff, download } from '../store';

const SIZE_MAP = {
	nano: {
		rgb: 4,
		canvas: 8
	},
	xs: {
		rgb: 16,
		canvas: 64
	},
	sm: {
		rgb: 25,
		canvas: 125
	},
	md: {
		rgb: 64,
		canvas: 512
	},
	lg: {
		rgb: 100,
		canvas: 1000
	},
	xl: {
		rgb: 256,
		canvas: 4096
	}
};

export const sketchRgbSmoke = (canvasSize: CanvasSize, restrictOverlap: boolean) => {
	const puffContainer = document.getElementById('puff-container');
	if (puffContainer === null) {
		alert('Puff Container is null....');
		return;
	}
	const containerWidth = puffContainer.offsetWidth;
	const containerHeight = puffContainer.offsetHeight;

	const DISPLAY_WIDTH = containerWidth;
	const RGB_SIZE = SIZE_MAP[canvasSize].rgb;
	const CANVAS_WIDTH = SIZE_MAP[canvasSize].canvas;
	const CANVAS_ID_LIMIT = Math.pow(RGB_SIZE, 3);
	const SCALE = DISPLAY_WIDTH / CANVAS_WIDTH;

	const sketch: Sketch = (p5: p5) => {
		let painting: p5.Image;
		p5.disableFriendlyErrors = true;
		const worker = new Worker(new URL('rgb-worker.ts', import.meta.url), {
			/* @vite-ignore */
			name: `${canvasSize}:${restrictOverlap}`,
			type: 'module'
		});
		let pixelCount = 0;

		p5.setup = () => {
			// ~~~~~~~~~~~~~~~~~~~~~~~
			// DISPLAY SETUP
			// ~~~~~~~~~~~~~~~~~~~~~~~
			p5.createCanvas(DISPLAY_WIDTH, DISPLAY_WIDTH);
			p5.noSmooth();
			painting = p5.createImage(CANVAS_WIDTH, CANVAS_WIDTH);
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
