export const updateCanvasTrackers = (
	id: number,
	colorId: number,
	options: Set<number>,
	history: Map<number, number>,
	canvasWidth: number
) => {
	const addPossible = (delta: number) => {
		if (!history.has(id + delta)) {
			options.add(id + delta);
		}
	};

	options.delete(id);
	history.set(id, colorId);
	addPossible(canvasWidth); // down
	addPossible(-canvasWidth); // up
	addPossible(1); // right
	addPossible(-1); // left
};

export const canvasIdToCoordinates = (id: number, canvasWidth: number) => {
	return [id % canvasWidth, Math.floor(id / canvasWidth)];
};

export const getNextPixel = (canvasOptions: Set<number>) => {
	let items = Array.from(canvasOptions);
	return items[Math.floor(Math.random() * items.length)];
};

export const getSurroundingPixels = (
	id: number,
	canvasWidth: number,
	history: Map<number, number>
) => {
	const inBounds = (id: number) => {
		return id > 0 && id < Math.pow(canvasWidth, 2);
	};

	const surrounding = [];
	if (inBounds(id - canvasWidth) && history.has(id - canvasWidth))
		surrounding.push(id - canvasWidth); // up
	if (inBounds(id + canvasWidth) && history.has(id + canvasWidth))
		surrounding.push(id + canvasWidth); // down
	if (inBounds(id - 1) && history.has(id - 1)) surrounding.push(id - 1); // left
	if (inBounds(id + 1) && history.has(id + 1)) surrounding.push(id + 1); // right

	return surrounding;
};

export const getColorIdToSearchFrom = (
	id: number,
	canvasWidth: number,
	history: Map<number, number>
) => {
	const surrounding = getSurroundingPixels(id, canvasWidth, history);
	const randomId = surrounding[Math.floor(Math.random() * surrounding.length)];
	const baseColorId = history.get(randomId);

	// baseColorId could be undefined from get() but its not possible to
	// have a pixel not be adjacent to any others.
	return baseColorId as number;
};
