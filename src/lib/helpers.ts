import { colorspaceIdToCoordinates } from './colorspace';

export function updateCanvasTrackers(
	id: number,
	colorId: number,
	options: Set<number>,
	history: Map<number, number>,
	canvasWidth: number
) {
	function addPossible(delta: number) {
		const newOption = id + delta;
		if (!history.has(newOption) && newOption < Math.pow(canvasWidth, 2) && newOption >= 0) {
			options.add(newOption);
		}
	}

	options.delete(id);
	history.set(id, colorId);
	addPossible(canvasWidth); // down
	addPossible(-canvasWidth); // up
	addPossible(1); // right
	addPossible(-1); // left
}

export function update3DColorspaceTracker(
	id: number,
	options: Set<number>,
	history: Set<number>,
	rgbCubeRoot: number
) {
	function addPossible(delta: number) {
		const newOption = id + delta;
		if (!history.has(newOption) && newOption < upBound && newOption >= 0) {
			options.add(newOption);
		}
	}

	const upBound = Math.pow(rgbCubeRoot, 3);
	const xDif = Math.pow(rgbCubeRoot, 0);
	const zDif = Math.pow(rgbCubeRoot, 1);
	const yDif = Math.pow(rgbCubeRoot, 2);

	options.delete(id);
	history.add(id);
	addPossible(xDif); // right
	addPossible(-xDif); // left
	addPossible(zDif); // forward
	addPossible(-zDif); // backward
	addPossible(yDif); // down
	addPossible(-yDif); // up
}

export function canvasIdToCoordinates(id: number, canvasWidth: number) {
	return [id % canvasWidth, Math.floor(id / canvasWidth)];
}

export function getNextPixel(canvasOptions: Set<number>) {
	let items = Array.from(canvasOptions);
	return items[Math.floor(Math.random() * items.length)];
}

export function getSurroundingPixels(
	id: number,
	canvasWidth: number,
	history: Map<number, number>
) {
	const surrounding = [];

	const up = history.get(id - canvasWidth);
	const down = history.get(id + canvasWidth);
	const left = history.get(id - 1);
	const right = history.get(id + 1);
	up ? surrounding.push(id - canvasWidth) : null;
	down ? surrounding.push(id + canvasWidth) : null;
	left ? surrounding.push(id - 1) : null;
	right ? surrounding.push(id + 1) : null;

	return surrounding;
}

// checks adjancet CANVAS pixels and randomly picks a color
// to be the root of the color search
export function getColorIdToSearchFrom(
	id: number,
	canvasWidth: number,
	history: Map<number, number>
) {
	const surrounding = getSurroundingPixels(id, canvasWidth, history);
	const randomId = surrounding[Math.floor(Math.random() * surrounding.length)];
	const baseColorId = history.get(randomId);

	// baseColorId could be undefined from get() but its not possible to
	// have a pixel not be adjacent to any others.
	return baseColorId as number;
}

export function benchmark() {
	const iterations = 32000000;
	console.time('split');
	for (let i = 0; i < iterations; i++) {
		const coords = '1,2,3';
		coords.split(',');
	}
	console.timeEnd('split');

	console.time('convert');
	for (let i = 0; i < iterations; i++) {
		colorspaceIdToCoordinates(123, 16);
	}
	console.timeEnd('convert');
}
