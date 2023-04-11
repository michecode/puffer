import type p5 from 'p5';
import type { Sketch } from 'p5-svelte';
import { kdTree } from 'kd-tree-javascript';

type RGBCoords = [x: number, y: number, z: number];
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

export const sketchRgbSmoke = (canvasSize: CanvasSize) => {
	const DISPLAY_WIDTH = 512;
	const SCALE = DISPLAY_WIDTH / SIZE_MAP[canvasSize].canvas;
	const RGB_SIZE = SIZE_MAP[canvasSize].rgb;
	const RGB_FULL_SIZE = Math.pow(RGB_SIZE, 3);
	const CANVAS_WIDTH = SIZE_MAP[canvasSize].canvas;
	const CANVAS_ID_LIMIT = Math.pow(CANVAS_WIDTH, 2);

	const canvasOptions: Set<number> = new Set();
	const canvasHistory: Map<number, RGBCoords> = new Map(); // key = canvas id || value = color id
	let colorHistory: Set<number> = new Set();
	let colorOptions: kdTree<RGBCoords>;

	const sketch: Sketch = (p5: p5) => {
		let painting: p5.Image;
		p5.disableFriendlyErrors = true;

		p5.setup = () => {
			// ~~~~~~~~~~~~~~~~~~~~~~~
			// DISPLAY SETUP
			// ~~~~~~~~~~~~~~~~~~~~~~~
			p5.createCanvas(DISPLAY_WIDTH, DISPLAY_WIDTH);
			p5.noSmooth();
			painting = p5.createImage(CANVAS_WIDTH, CANVAS_WIDTH);
			painting.loadPixels();

			// ~~~~~~~~~~~~~~~~~~~~~~~
			// DATA SETUP
			// ~~~~~~~~~~~~~~~~~~~~~~~
			// get seeds. random number between 0 and RGB's color possibilities
			const canvasSeed = Math.floor(p5.random(0, RGB_FULL_SIZE));
			const colorSeed = Math.floor(p5.random(0, RGB_FULL_SIZE));

			// paint first pixel
			const [x, y] = canvasIdToCoordinates(canvasSeed);
			// colorspace x, colorspace y etc.
			const [csX, csY, csZ] = colorIdToCoordinates(colorSeed);
			painting.set(x, y, p5.color(csX, csY, csZ));

			// build colorspace kd tree
			const initialPoints: RGBCoords[] = [];
			function pushPoints(coords: RGBCoords) {
				if (xyzInBounds(coords)) {
					initialPoints.push(coords);
				}
			}
			pushPoints([csX + 1, csY, csZ]);
			pushPoints([csX - 1, csY, csZ]);
			pushPoints([csX, csY + 1, csZ]);
			pushPoints([csX, csY - 1, csZ]);
			pushPoints([csX, csY, csZ + 1]);
			pushPoints([csX, csY, csZ - 1]);

			console.log(initialPoints);
			function distanceEquation(option: RGBCoords, origin: RGBCoords) {
				// option 0 = x 1 = y z = 2
				return (
					(option[0] - origin[0]) ** 2 + (option[1] - origin[1]) ** 2 + (option[2] - origin[2]) ** 2
				);
			}
			colorOptions = new kdTree(initialPoints, distanceEquation, [0, 1, 2]);

			// prep trackers
			updateCanvasTrackers(canvasSeed, [csX, csY, csZ]);
			painting.updatePixels();
			p5.image(painting, 0, 0);
			// p5.noLoop();
		};

		p5.draw = () => {
			// get next pixel
			const next = getNextPixel();
			const searchPoint = getCoordsToSearchFrom(next);
			const closestColor = search3D(searchPoint);
			const [x, y] = canvasIdToCoordinates(next);

			painting.set(x, y, p5.color(...closestColor));

			updateColorTrackers(closestColor);
			updateCanvasTrackers(next, closestColor);

			if (canvasHistory.size === CANVAS_ID_LIMIT) {
				alert('Finished');
				p5.noLoop();
			}

			// place pixel
			painting.updatePixels();
			p5.scale(SCALE);
			p5.image(painting, 0, 0);
		};
	};

	/*
  BELOW ARE HELPERS.
  */
	function updateCanvasTrackers(id: number, color: RGBCoords) {
		function addPossible(delta: number) {
			const newOption = id + delta;
			if (!canvasHistory.has(newOption) && newOption < CANVAS_ID_LIMIT && newOption >= 0) {
				canvasOptions.add(newOption);
			}
		}

		canvasOptions.delete(id);
		canvasHistory.set(id, color);
		addPossible(CANVAS_WIDTH); // down
		addPossible(-CANVAS_WIDTH); // up
		addPossible(1); // right
		addPossible(-1); // left
	}

	function updateColorTrackers(coords: RGBCoords) {
		function addPossible(coords: RGBCoords) {
			const colorPointId = coordinatesToColorId(coords);
			if (!colorHistory.has(colorPointId)) {
				if (coords[0] >= 0 && coords[0] < RGB_SIZE) {
					if (coords[1] >= 0 && coords[1] < RGB_SIZE) {
						if (coords[2] >= 0 && coords[2] < RGB_SIZE) {
							colorOptions.insert(coords);
						}
					}
				}
			}
		}
		const colorPointId = coordinatesToColorId(coords);
		const [x, y, z] = coords;

		colorOptions.remove(coords);
		colorHistory.add(colorPointId);
		addPossible([x + 1, y, z]);
		addPossible([x - 1, y, z]);
		addPossible([x, y + 1, z]);
		addPossible([x, y - 1, z]);
		addPossible([x, y, z + 1]);
		addPossible([x, y, z - 1]);
	}

	function coordinatesToColorId(coords: RGBCoords) {
		const [x, y, z] = coords;
		return x + (y * Math.pow(RGB_SIZE, 2) + z * RGB_SIZE);
	}

	function colorIdToCoordinates(id: number) {
		const x = id % RGB_SIZE;
		const y = Math.floor((id - 1) / RGB_SIZE) % RGB_SIZE;
		const z = Math.floor((id - 1) / Math.pow(RGB_SIZE, 2)) % RGB_SIZE;

		const coords = [
			Math.floor(256 * (x / (RGB_SIZE - 1))),
			Math.floor(256 * (y / (RGB_SIZE - 1))),
			Math.floor(256 * (z / (RGB_SIZE - 1)))
		];
		return coords as RGBCoords;
	}

	function canvasIdToCoordinates(id: number) {
		return [id % CANVAS_WIDTH, Math.floor(id / CANVAS_WIDTH)];
	}

	function getNextPixel() {
		let items = Array.from(canvasOptions);
		return items[Math.floor(Math.random() * items.length)];
	}

	function getSurroundingPixels(id: number) {
		const surrounding = [];

		const up = canvasHistory.get(id - CANVAS_WIDTH);
		const down = canvasHistory.get(id + CANVAS_WIDTH);
		const left = canvasHistory.get(id - 1);
		const right = canvasHistory.get(id + 1);
		up ? surrounding.push(id - CANVAS_WIDTH) : null;
		down ? surrounding.push(id + CANVAS_WIDTH) : null;
		left ? surrounding.push(id - 1) : null;
		right ? surrounding.push(id + 1) : null;

		return surrounding;
	}

	// checks adjancet CANVAS pixels and randomly picks a color
	// to be the root of the color search
	function getCoordsToSearchFrom(id: number) {
		const surrounding = getSurroundingPixels(id);
		const randomId = surrounding[Math.floor(Math.random() * surrounding.length)];
		const baseColorId = canvasHistory.get(randomId);

		// baseColorId could be undefined from get() but its not possible to
		// have a pixel not be adjacent to any others.
		return baseColorId as RGBCoords;
	}

	function xyzInBounds(coords: RGBCoords) {
		if (coords[0] >= 0 && coords[0] < RGB_SIZE) {
			if (coords[1] >= 0 && coords[1] < RGB_SIZE) {
				if (coords[2] >= 0 && coords[2] < RGB_SIZE) {
					return true;
				}
			}
		}
		return false;
	}

	function search3D(searchPoint: RGBCoords) {
		if (colorHistory.size === RGB_FULL_SIZE) {
			colorHistory = new Set();
			const newSeed = Math.floor(Math.random() * RGB_FULL_SIZE);
			return colorIdToCoordinates(newSeed);
		}

		const nearestNeighbor = colorOptions.nearest(searchPoint, 1);
		return nearestNeighbor[0][0];
	}

	return sketch;
};
