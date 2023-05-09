type PaintingPresetSize = 'nano' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type PixelData = [x: number, y: number, r: number, g: number, b: number];

type RGBCoords = [x: number, y: number, z: number];
type RGBColorValues = [r: number, g: number, b: number];

type Coordinates2D = [x: number, y: number];
type Coordinates3D = [x: number, y: number, z: number];

interface GenerationOptions {
	sampleMethod: 'grid' | 'rm';
	width: number;
	height: number;
	rgbSize: number;
	restrictOverlap: boolean;
	allowRegen: boolean;
	colorSeed: Coordinates2D | Coordinates3D | undefined;
	paintingSeed: Coordinates2D | undefined;
}
