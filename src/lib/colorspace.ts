/*
searches full 256 bit rgb

id = the id of the point in space where you search from
(NOT THE CANVAS ID)

possible optimizations.. xDif = 1, dont access memory. could also make the rest hard coded but idk yet
*/
export const search3D = (id: number, usedColors: Set<number>, rgbCubeRoot: number) => {
	/*
  recursive function to look for possible colors.
  if possibleColors is still empty after checking the starting ID. it will check
  spawn looper on the 6 surrounding points. (assuming none of them have been usedColors yet)
  */
	const looper = (id: number) => {
		const spawn = (delta: number) => {
			if (!usedColors.has(id + delta)) looper(id + delta);
		};

		// if you found something you can return.
		if (searchSurrounding3D(id)) return;
		// if no color was found then spawn lookers.
		else {
			spawn(xDif); // left
			spawn(-xDif); // right
			spawn(zDif); // foward
			spawn(-zDif); // backward
			spawn(yDif); // down
			spawn(-yDif); // up
		}
	};

	const searchSurrounding3D = (id: number) => {
		const checkPossible = (delta: number) => {
			if (!usedColors.has(id + delta)) {
				found = true;
				possibleColors.add(id + delta);
			}
		};

		if (id < 0 || id > upBound - 1) {
			return false;
		}

		let found = false;
		checkPossible(xDif); // right
		checkPossible(-xDif); // left
		checkPossible(zDif); // forward
		checkPossible(-zDif); // backward
		checkPossible(yDif); // down
		checkPossible(-yDif); // up
		console.log(possibleColors, 'colors');
		return found;
	};

	const upBound = Math.pow(rgbCubeRoot, 3);
	const xDif = Math.pow(rgbCubeRoot, 0);
	const zDif = Math.pow(rgbCubeRoot, 1);
	const yDif = Math.pow(rgbCubeRoot, 2);

	// if there are no possibilities (ran out of colors in color space) then re-seed by returning a random id.
	if (usedColors.size === Math.pow(rgbCubeRoot, 3)) {
		usedColors = new Set();
		return Math.floor(Math.random() * upBound);
	}

	const possibleColors: Set<number> = new Set();
	looper(id);
	// randomly pick an id from possibleColors
	// we'll update herstory and possum in main alg.
	let items = Array.from(possibleColors);
	return items[Math.floor(Math.random() * items.length)];
};

export const colorspaceIdToCoordinates = (id: number, rgbCubeRoot = 256) => {
	const LEAP_FACTOR = Math.floor(256 / rgbCubeRoot);
	const x = id % rgbCubeRoot;
	const y = Math.floor(id / Math.pow(rgbCubeRoot, 2));
	const z = Math.floor((id - y * Math.pow(rgbCubeRoot, 2)) / 3);
	const coords = [x * LEAP_FACTOR, y * LEAP_FACTOR, z * LEAP_FACTOR];
	console.log(coords, 'coords');
	return coords;
};
