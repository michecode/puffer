import type p5 from 'p5';
import type { Sketch } from 'p5-svelte';

type CanvasSize = 'nano' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type PixelData = [x: number, y: number, r: number, g: number, b: number];

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

export const sketchRgbSmoke = (canvasSize: CanvasSize) => {
	const DISPLAY_WIDTH = 512;
	const CANVAS_WIDTH = SIZE_MAP[canvasSize].canvas;
	const CANVAS_ID_LIMIT = Math.pow(CANVAS_WIDTH, 2);
	const SCALE = DISPLAY_WIDTH / SIZE_MAP[canvasSize].canvas;

	const sketch: Sketch = (p5: p5) => {
		let painting: p5.Image;
		p5.disableFriendlyErrors = true;
		const worker = new Worker(new URL('./rgb-worker.ts', import.meta.url), {
			name: canvasSize,
			type: 'module'
			/* @vite-ignore */
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
			p5.frameRate(1); // x worker requests per second
		};

		p5.draw = () => {
			worker.onmessage = function (event) {
				const bufferedPixels = event.data;
				bufferedPixels.forEach((pixel: PixelData) => {
					// painting.set( x, y, p5.color r, g, b  )
					painting.set(pixel[0], pixel[1], p5.color(pixel[2], pixel[3], pixel[4]));
					pixelCount++;
				});
			};

			worker.postMessage('heyyy:3');

			if (pixelCount === CANVAS_ID_LIMIT) {
				p5.noLoop();
				worker.terminate();
				alert('Done');
			}

			// place pixel
			painting.updatePixels();
			p5.scale(SCALE);
			p5.image(painting, 0, 0);
		};
	};

	return sketch;
};
