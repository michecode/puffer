import type p5 from 'p5';
import type { Sketch } from 'p5-svelte';
import { colorspaceIdToCoordinates, search3D } from './colorspace';

export const sketchRgbSmoke = () => {
	const sketch: Sketch = (p5: p5) => {
		const size = 4096;
		const rgbSize = 256;
		let painting: p5.Image;

		const canvasPossum: Set<number> = new Set();
		const canvasHerstory: Set<number> = new Set();
		const colorPossum: Set<number> = new Set();
		const colorHerstory: Set<number> = new Set();

		const paintPixel = (id: number) => {
			const [x, y] = canvasIdToCoordinates(id, rgbSize);
			const colorId = search3D(id, colorPossum);
			const [cX, cY, cZ] = colorspaceIdToCoordinates(colorId, rgbSize);

			painting.set(x, y, p5.color(cX, cY, cZ));

			updateTrackers(id, canvasPossum, canvasHerstory, rgbSize);
			updateTrackers(colorId, colorPossum, colorHerstory, rgbSize);
		};

		const getNextPixel = () => {
			let items = Array.from(canvasPossum);
			return items[Math.floor(Math.random() * items.length)];
		};

		p5.setup = () => {
			p5.createCanvas(size, size);
			painting = p5.createImage(size, size);
			painting.loadPixels();

			// get seeds
			const canvasSeed = Math.floor(p5.random(0, size ^ 2));
			const colorSeed = Math.floor(p5.random(0, size ^ 2));

			// paint first pixel
			const [x, y] = canvasIdToCoordinates(canvasSeed, rgbSize);
			const [cX, cY, cZ] = colorspaceIdToCoordinates(colorSeed, rgbSize);
			painting.set(x, y, p5.color(cX, cY, cZ));

			// prep trackers
			updateTrackers(canvasSeed, canvasPossum, canvasHerstory, rgbSize);
			updateTrackers(colorSeed, colorPossum, colorHerstory, rgbSize);
			painting.updatePixels();
			p5.image(painting, 0, 0);
		};

		p5.draw = () => {
			paintPixel(getNextPixel());
			painting.updatePixels();
			p5.image(painting, 0, 0);
		};
	};

	const updateTrackers = (id: number, possum: Set<number>, herstory: Set<number>, root: number) => {
		const xDif = root ^ 0;
		const zDif = root ^ 1;
		const yDif = root ^ 2;

		possum.delete(id);
		if (!herstory.has(id + xDif)) {
			possum.add(id + xDif); // right
		}
		if (!herstory.has(id - xDif)) {
			possum.add(id - xDif); // left
		}
		if (!herstory.has(id + zDif)) {
			possum.add(id + zDif); // forward
		}
		if (!herstory.has(id - zDif)) {
			possum.add(id - zDif); // backward
		}
		if (!herstory.has(id + yDif)) {
			possum.add(id + yDif); // down
		}
		if (!herstory.has(id - yDif)) {
			possum.add(id - yDif); // up
		}
		herstory.add(id);
	};

	const canvasIdToCoordinates = (id: number, length: number) => {
		return [id % length, Math.floor(id / length)];
	};

	return sketch;
};
