<script lang="ts">
	import P5, { type Sketch } from 'p5-svelte';

	let width = 750;
	let height = 750;
	let noiseScale = 0.02;
	let distortionStrength = 100;

	const sketch: Sketch = (p5) => {
		p5.setup = () => {
			p5.createCanvas(width, height);
			p5.background(255);
			p5.noStroke();
		};

		p5.draw = () => {
			for (let x = 0; x < width; x++) {
				for (let y = 0; y < height; y++) {
					let n = p5.noise(x * noiseScale, y * noiseScale);
					let brightness = p5.map(n, 0, 1, 0, 255);
					p5.fill(brightness);
					let dx = distortionStrength * p5.noise(x * noiseScale, y * noiseScale + 100);
					let dy = distortionStrength * p5.noise(x * noiseScale + 100, y * noiseScale);
					p5.ellipse(x + dx, y + dy, 10, 10);
				}
			}
		};
	};
</script>

<label>
	Width
	<input type="range" bind:value={width} min="100" max="1000" step="0.01" />
	{width}
</label>

<label>
	Height
	<input type="range" bind:value={height} min="100" max="1000" step="0.01" />
	{height}
</label>

<P5 {sketch} />
