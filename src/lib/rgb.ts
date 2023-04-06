import type p5 from 'p5';
import type { Sketch } from 'p5-svelte';
import { colorspaceIdToCoordinates, search3D } from './colorspace';
import {
	canvasIdToCoordinates,
	updateCanvasTrackers,
	getNextPixel,
	getColorIdToSearchFrom,
	update3DColorspaceTracker
} from './helpers';

type CanvasSize = 'nano' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

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

const DISPLAY_WIDTH = 512;
const SCALE = 8;

export const sketchRgbSmoke = (canvasSize: CanvasSize) => {
	const sketch: Sketch = (p5: p5) => {
		const RGB_SIZE = SIZE_MAP[canvasSize].rgb;
		const CANVAS_WIDTH = SIZE_MAP[canvasSize].canvas;
		let painting: p5.Image;

		const canvasOptions: Set<number> = new Set();
		const canvasHistory: Map<number, number> = new Map(); // key = canvas id || value = color id
		const colorHistory: Set<number> = new Set();
		const colorOptions: Set<number> = new Set();

		const paintPixel = (id: number) => {
			const baseColorId = getColorIdToSearchFrom(id, CANVAS_WIDTH, canvasHistory);
			const colorId = search3D(baseColorId, colorHistory, colorOptions, RGB_SIZE);
			const [cX, cY, cZ] = colorspaceIdToCoordinates(colorId, RGB_SIZE);
			const [x, y] = canvasIdToCoordinates(id, CANVAS_WIDTH);

			painting.set(x, y, p5.color(cX, cY, cZ));

			update3DColorspaceTracker(colorId, colorOptions, colorHistory, RGB_SIZE);
			updateCanvasTrackers(id, colorId, canvasOptions, canvasHistory, CANVAS_WIDTH);
		};

		p5.setup = () => {
			p5.createCanvas(DISPLAY_WIDTH, DISPLAY_WIDTH);
			// p5.pixelDensity(1);
			p5.noSmooth();
			painting = p5.createImage(CANVAS_WIDTH, CANVAS_WIDTH);
			painting.loadPixels();

			// get seeds. random number between 0 and RGB's color possibilities
			const canvasSeed = Math.floor(p5.random(0, Math.pow(RGB_SIZE, 3)));
			const colorSeed = Math.floor(p5.random(0, Math.pow(RGB_SIZE, 3)));

			// paint first pixel
			const [x, y] = canvasIdToCoordinates(canvasSeed, CANVAS_WIDTH);
			const [cX, cY, cZ] = colorspaceIdToCoordinates(colorSeed, RGB_SIZE);
			painting.set(x, y, p5.color(cX, cY, cZ));

			// prep trackers
			update3DColorspaceTracker(colorSeed, colorOptions, colorHistory, RGB_SIZE);
			updateCanvasTrackers(canvasSeed, colorSeed, canvasOptions, canvasHistory, CANVAS_WIDTH);
			painting.updatePixels();
			p5.image(painting, 0, 0);
		};

		p5.draw = () => {
			paintPixel(getNextPixel(canvasOptions));
			painting.updatePixels();
			p5.scale(SCALE);
			p5.image(painting, 0, 0);
		};
	};

	return sketch;
};
