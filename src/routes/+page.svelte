<script lang="ts">
	import { sketchRgbSmoke } from '$lib/3D-Colorspace/rgb';
	import P5 from 'p5-svelte';

	const rgbColorSpace = sketchRgbSmoke('md');
</script>

<P5 sketch={rgbColorSpace} />
