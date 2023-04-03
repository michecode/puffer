/*
searches full 256 bit rgb

possible optimizations.. xDif = 1, dont access memory. could also make the rest hard coded but idk yet
*/
export const search3D = (id: number, possum: Set<number>) => {
	/*
  recursive function to look for possible colors.
  if possibleColors is still empty after checking the starting ID. it will check
  spawn looper on the 6 surrounding points. (assuming none of them have been checked yet)
  */
	const looper = (id: number) => {
		// if you found something you can return.
		if (searchSurrounding3D(id, possum)) return;
		// if no color was found the spawn lookers.
		else {
			if (!checked.has(id + xDif)) {
				looper(id + xDif); // right
			}
			if (!checked.has(id - xDif)) {
				looper(id - xDif); // left
			}
			if (!checked.has(id + zDif)) {
				looper(id + zDif); // forward
			}
			if (!checked.has(id - zDif)) {
				looper(id - zDif); // backward
			}
			if (!checked.has(id + yDif)) {
				looper(id + yDif); // down
			}
			if (!checked.has(id - yDif)) {
				looper(id - yDif); // up
			}
		}
	};

	const searchSurrounding3D = (id: number, possum: Set<number>) => {
		if (id < 0 || id > upBound - 1) {
			return false;
		}

		let found = false;
		if (possum.has(id + xDif)) {
			// right
			found = true;
			possibleColors.push(id + xDif);
		}
		if (possum.has(id - xDif)) {
			// left
			found = true;
			possibleColors.push(id - xDif);
		}
		if (possum.has(id + zDif)) {
			// forward
			found = true;
			possibleColors.push(id + zDif);
		}
		if (possum.has(id - zDif)) {
			// backward
			found = true;
			possibleColors.push(id - zDif);
		}
		if (possum.has(id + yDif)) {
			// down
			found = true;
			possibleColors.push(id + yDif);
		}
		if (possum.has(id - yDif)) {
			// up
			found = true;
			possibleColors.push(id - yDif);
		}
		checked.add(id + xDif);
		checked.add(id - xDif);
		checked.add(id + zDif);
		checked.add(id - zDif);
		checked.add(id + yDif);
		checked.add(id - yDif);
		console.log(possibleColors);
		return found;
	};

	// if there are no possibilities (ran out of colors in color space) then re-seed.
	if (possum.size === 0) {
	}

	const size = 256;
	const upBound = 256 ^ 3;
	const xDif = size ^ 0;
	const zDif = size ^ 1;
	const yDif = size ^ 2;

	const possibleColors: number[] = [];
	const checked: Set<number> = new Set();
	console.log('heyy', id);
	looper(id);
	console.log(searchSurrounding3D(id, possum), 'yas');
	console.log(`Searched ${checked.size} points. Found ${possibleColors.length} possible colors.`);
	// randomly pick an id from possibleColors
	// we'll update herstory and possum in main alg.
	return Math.floor(Math.random() * possibleColors.length);
};

export const colorspaceIdToCoordinates = (id: number, root = 256) => {
	const x = id % root;
	const y = Math.floor(id / (root ^ 2));
	const z = Math.floor((id - y * (root ^ 2)) / 3);
	return [x, y, z];
};
