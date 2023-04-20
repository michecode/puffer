import { kdTree } from 'kd-tree-javascript';

const generationParameters = self.name.split(':');
console.log(generationParameters, 'hey');
// order of options is [ width, height, rgbSize, restrict-overlap ]

const CANVAS_WIDTH = Number(generationParameters[0]);
const CANVAS_HEIGHT = Number(generationParameters[1]);
const RGB_SIZE = Number(generationParameters[2]);
const RGB_FULL_SIZE = Math.pow(RGB_SIZE, 3);
const CANVAS_ID_LIMIT = CANVAS_WIDTH * CANVAS_HEIGHT;
// Flags
const RESTRICT_OVERLAP = generationParameters[3] === 'true';

// Data
const canvasOptions: Set<number> = new Set();
const canvasHistory: Map<number, RGBCoords> = new Map(); // key = canvas id || value = color id
let colorHistory: Set<string> = new Set();
let colorOptionsSet: Set<string> = new Set();
let colorOptions: kdTree<RGBCoords>;

let updateBuffer: PixelData[] = [];

// ~~~~~~~~~~~~~~~~~~~~~~~
// DATA SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~
// get seeds. random number between 0 and RGB's color possibilities
const canvasSeed = Math.floor(Math.random() * RGB_FULL_SIZE);
const colorSeed = Math.floor(Math.random() * RGB_FULL_SIZE);

// paint first pixel
const [x, y] = canvasIdToCoordinates(canvasSeed);
// colorspace x, colorspace y etc.
const [csX, csY, csZ] = colorIdToCoordinates(colorSeed);
const [r, g, b] = coordinatesToRGB([csX, csY, csZ]);
updateBuffer.push([x, y, r, g, b]);
colorHistory.add([csX, csY, csZ].toString());

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
// update set
colorOptionsSet.add([csX + 1, csY, csZ].toString());
colorOptionsSet.add([csX - 1, csY, csZ].toString());
colorOptionsSet.add([csX, csY + 1, csZ].toString());
colorOptionsSet.add([csX, csY - 1, csZ].toString());
colorOptionsSet.add([csX, csY, csZ + 1].toString());
colorOptionsSet.add([csX, csY, csZ - 1].toString());

function distanceEquation(option: RGBCoords, origin: RGBCoords) {
	// option 0 = x 1 = y z = 2
	return (option[0] - origin[0]) ** 2 + (option[1] - origin[1]) ** 2 + (option[2] - origin[2]) ** 2;
}
colorOptions = new kdTree(initialPoints, distanceEquation, [0, 1, 2]);

// prep trackers
// we only need to update canvas here bc I hard coded the first color update above
updateCanvasTrackers(canvasSeed, [csX, csY, csZ]);

/*
PROCESSING LOOP @maddy LOOK HERE!!!!
*/
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

		updateColorTrackers(closestColor);
		updateCanvasTrackers(next, closestColor);
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
	if (RESTRICT_OVERLAP && (id + 1) % CANVAS_WIDTH !== 0) {
		addPossible(1); // right
	}
	if (RESTRICT_OVERLAP && id % CANVAS_WIDTH !== 0) {
		addPossible(-1); // left
	}
}

function updateColorTrackers(coords: RGBCoords) {
	function addPossible(coords: RGBCoords) {
		// const colorPointId = coordinatesToColorId(coords);
		if (colorOptionsSet.has(coords.toString())) {
			return;
		}

		if (!colorHistory.has(coords.toString())) {
			if (coords[0] >= 0 && coords[0] < RGB_SIZE) {
				if (coords[1] >= 0 && coords[1] < RGB_SIZE) {
					if (coords[2] >= 0 && coords[2] < RGB_SIZE) {
						colorOptions.insert(coords);
						colorOptionsSet.add(coords.toString());
					}
				}
			}
		}
	}
	// const colorPointId = coordinatesToColorId(coords);
	const [x, y, z] = coords;

	colorOptions.remove(coords);
	colorHistory.add(coords.toString());
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
	if (colorHistory.size === RGB_FULL_SIZE) {
		colorHistory = new Set();
		const newSeed = Math.floor(Math.random() * RGB_FULL_SIZE);
		return colorIdToCoordinates(newSeed);
	}

	const nearestNeighbor = colorOptions.nearest(searchPoint, 1);
	return nearestNeighbor[0][0];
}
