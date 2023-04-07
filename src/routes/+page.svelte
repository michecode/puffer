<script lang="ts">
	import { sketchRgbSmoke } from '$lib/rgb';
	import P5 from 'p5-svelte';

	const rgbColorSpace = sketchRgbSmoke('sm');
</script>

<P5 sketch={rgbColorSpace} />
