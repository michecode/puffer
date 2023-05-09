<article>
	<h1 class="font-bold">User Guide / Docs (?)</h1>
	<p>
		Some of the settings can be confusing and it's expected in a very specific manner by the program
		so this page is to help you understand the options.
	</p>
	<h1 class="font-bold">Color and Painting Seed</h1>
	<p>
		When picking your own color seed, you should enter your coordinates in the format of "x,y,z" for
		RGB mode generations and "x,y" for image mode generations. <br /><br /> However, when you're
		using a RGB root value that is not 256 you need to scale your coordinates to fit within your RGB
		colorspace. So for example, if you had a RGB root of 64, your color seed could not be "75,23,89"
		because the x and z values are outside the bounds of your defined colorspace.<br /><br />These
		coordinates are 0-indexed but if it's equal to its limit I will subtract one to make it work.
		For example using the painting seed of (512,512) on a 512x512 canvas the code won't work so
		internally I will set it to (511,511).
	</p>
</article>
