<script lang="ts">
	import { sketchRgbSmoke } from '$lib/3D-Colorspace/rgb';
	import P5 from 'p5-svelte';

	const rgbColorSpace = sketchRgbSmoke('lg');
</script>

<P5 sketch={rgbColorSpace} />
