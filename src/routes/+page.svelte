<script lang="ts">
	import { sketchRgbSmoke } from '$lib/rgb';
	import P5, { type Sketch } from 'p5-svelte';

	const rgbColorSpace = sketchRgbSmoke();
</script>

<P5 sketch={rgbColorSpace} />
