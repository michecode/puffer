/*
searches full 256 bit rgb

id = the id of the point in space where you search from
(NOT THE CANVAS ID)
*/
export function search3D(
	id: number,
	usedColors: Set<number>,
	colorOptions: Set<number>,
	rgbCubeRoot: number
) {
	function getArrayOfClosestColorIDs() {
		let closestColorOptions: number[] = [];
		const [xOrigin, yOrigin, zOrigin] = colorspaceIdToCoordinates(id, rgbCubeRoot);
		let shortest = 443; // distance between (0,0,0) and (255,255,255) + 1
		colorOptions.forEach((option) => {
			const [xOption, yOption, zOption] = colorspaceIdToCoordinates(option, rgbCubeRoot);
			// I don't need the actually distance so I can use
			// the squared distance to prevent sqrt'ing
			// const distance = Math.sqrt(
			// 	Math.pow(xOption - xOrigin, 2) +
			// 		Math.pow(yOption - yOrigin, 2) +
			// 		Math.pow(zOption - zOrigin, 2)
			// );
			const sqrdDistance =
				Math.pow(xOption - xOrigin, 2) +
				Math.pow(yOption - yOrigin, 2) +
				Math.pow(zOption - zOrigin, 2);
			if (shortest > sqrdDistance) {
				closestColorOptions = [option];
				shortest = sqrdDistance;
			} else if (shortest === sqrdDistance) {
				closestColorOptions.push(option);
			}
		});
		return closestColorOptions;
	}

	const upBound = Math.pow(rgbCubeRoot, 3);

	// if there are no possibilities (ran out of colors in color space) then re-seed by returning a random id.
	if (usedColors.size === upBound) {
		usedColors = new Set();
		return Math.floor(Math.random() * upBound);
	}

	// randomly pick an id from possibleColors
	// we'll update herstory and possum in main alg.
	let closestColors = getArrayOfClosestColorIDs();
	return closestColors[Math.floor(Math.random() * closestColors.length)];
}

export function colorspaceIdToCoordinates(id: number, rgbCubeRoot: number) {
	const x = id % rgbCubeRoot;
	const y = Math.floor((id - 1) / rgbCubeRoot) % rgbCubeRoot;
	const z = Math.floor((id - 1) / Math.pow(rgbCubeRoot, 2)) % rgbCubeRoot;

	const coords = [
		Math.floor(256 * (x / (rgbCubeRoot - 1))),
		Math.floor(256 * (y / (rgbCubeRoot - 1))),
		Math.floor(256 * (z / (rgbCubeRoot - 1)))
	];
	return coords;
}
