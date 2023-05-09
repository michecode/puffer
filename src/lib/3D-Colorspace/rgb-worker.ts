import { kdTree } from 'kd-tree-javascript';

const generationParameters = self.name.split(':');
// order of options is [ width, height, rgbSize, colorSeed, paintingSeed, restrict-overlap, allow-regen ]

const CANVAS_WIDTH = Number(generationParameters[0]);
const CANVAS_HEIGHT = Number(generationParameters[1]);
const RGB_SIZE = Number(generationParameters[2]);
const RGB_FULL_SIZE = Math.pow(RGB_SIZE, 3);
const CANVAS_ID_LIMIT = CANVAS_WIDTH * CANVAS_HEIGHT;
// Provided Seeds
const COLOR_SEED_COORDS =
	generationParameters[3] === 'undefined' ? undefined : generationParameters[3];
const CANVAS_SEED_COORDS =
	generationParameters[4] === 'undefined' ? undefined : generationParameters[4];
// Flags
const RESTRICT_OVERLAP = generationParameters[5] === 'true';
const ALLOW_COLOR_TREE_REGENERATION = generationParameters[6] === 'true';

// Data
const canvasOptions: Set<number> = new Set();
const canvasHistory: Map<number, RGBCoords> = new Map(); // key = canvas id || value = color id
let colorOptions: kdTree<RGBCoords>;

let updateBuffer: PixelData[] = [];

// ~~~~~~~~~~~~~~~~~~~~~~~
// DATA SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~
// if painting seed is provided
let canvasSeed, colorSeed;
if (CANVAS_SEED_COORDS) {
	const [x, y] = CANVAS_SEED_COORDS.split(',');
	canvasSeed = coordinatesToCanvasId([Number(x), Number(y)]);
} else {
	canvasSeed = Math.floor(Math.random() * CANVAS_ID_LIMIT);
}

if (COLOR_SEED_COORDS) {
	const [x, y, z] = COLOR_SEED_COORDS.split(',');
	colorSeed = coordinatesToColorId([Number(x), Number(y), Number(z)]);
} else {
	colorSeed = Math.floor(Math.random() * RGB_FULL_SIZE);
}

// paint first pixel
const [x, y] = canvasIdToCoordinates(canvasSeed);
// colorspace x, colorspace y etc.
const [csX, csY, csZ] = colorIdToCoordinates(colorSeed);
const [r, g, b] = coordinatesToRGB([csX, csY, csZ]);
updateBuffer.push([x, y, r, g, b]);

generateKDTree();

updateCanvasTrackers(canvasSeed, [csX, csY, csZ]);
// YOU HAVE YOU REMOVE THE FIRST ONE LIKE THIS OR IT THROWS ERRORS I WILL SCREAM FOREVER
// IT LITERALLY OUTPUTS THE SAME ARRAY
const nearest = search3D([csX, csY, csZ]);
updateColorTrackers(nearest);

onmessage = function (event) {
	console.log('got a message. fuck off.');
};

function process() {
	while (canvasHistory.size !== CANVAS_ID_LIMIT) {
		const next = getNextPixel();
		const searchPoint = getCoordsToSearchFrom(next);
		const closestColor = search3D(searchPoint);
		const [x, y] = canvasIdToCoordinates(next);

		const [r, g, b] = coordinatesToRGB(closestColor);
		updateBuffer.push([x, y, r, g, b]);

		// if searchPoint = closestColor that means it's the last color.
		if (
			closestColor[0] === searchPoint[0] &&
			closestColor[1] === searchPoint[1] &&
			closestColor[2] === searchPoint[2]
		) {
			updateCanvasTrackers(next, closestColor);
			updateColorTrackers(closestColor);
			// it hits zero if theres no nodes in tree
			if (colorOptions.balanceFactor() === 0 || colorOptions.balanceFactor() === Infinity) {
				if (ALLOW_COLOR_TREE_REGENERATION) {
					console.log('regen');
					generateKDTree();
				}
			}
		} else {
			updateCanvasTrackers(next, closestColor);
			updateColorTrackers(closestColor);
		}

		if (canvasHistory.size % 10000 === 0) {
			// every 10000 pixels send the buffer
			self.postMessage(updateBuffer);
			updateBuffer = [];
		}
	}
	// send remaining pixels
	self.postMessage(updateBuffer);
	updateBuffer = [];
}

process();

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
	if (RESTRICT_OVERLAP) {
		// if not rightmost pixel
		if ((id + 1) % CANVAS_WIDTH !== 0) {
			addPossible(1); // right
		}
		// if not leftmost pixel
		if (id % CANVAS_WIDTH !== 0) {
			addPossible(-1); // left
		}
	} else {
		addPossible(1);
		addPossible(-1);
	}
}

function updateColorTrackers(coords: RGBCoords) {
	colorOptions.remove(coords);
}

function coordinatesToColorId(coords: RGBCoords) {
	const [x, y, z] = coords;
	return x + (y * Math.pow(RGB_SIZE, 2) + z * RGB_SIZE);
}

function coordinatesToCanvasId(coords: Coordinates2D) {
	const [x, y] = coords;
	return x + y * CANVAS_WIDTH;
}

function colorIdToCoordinates(id: number) {
	const x = id % RGB_SIZE;
	const y = Math.floor((id - 1) / RGB_SIZE) % RGB_SIZE;
	const z = Math.floor((id - 1) / Math.pow(RGB_SIZE, 2)) % RGB_SIZE;

	return [x, y, z] as RGBCoords;
}

function coordinatesToRGB(coords: RGBCoords): RGBColorValues {
	return [
		Math.floor(256 * (coords[0] / (RGB_SIZE - 1))),
		Math.floor(256 * (coords[1] / (RGB_SIZE - 1))),
		Math.floor(256 * (coords[2] / (RGB_SIZE - 1)))
	];
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
	const nearestNeighbor = colorOptions.nearest(searchPoint, 1);
	if (nearestNeighbor.length === 0) {
		// there is no closest color because its the last color!
		return searchPoint;
	} else {
		return nearestNeighbor[0][0];
	}
}

function generateKDTree() {
	function distanceEquation(option: RGBCoords, origin: RGBCoords) {
		// option 0 = x 1 = y 2 = z
		return (
			(option[0] - origin[0]) ** 2 + (option[1] - origin[1]) ** 2 + (option[2] - origin[2]) ** 2
		);
	}

	const points = new Array(RGB_FULL_SIZE);
	for (let i = 0; i < RGB_FULL_SIZE; i++) {
		points[i] = colorIdToCoordinates(i);
	}
	colorOptions = new kdTree(points, distanceEquation, [0, 1, 2]);
}
