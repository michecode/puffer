import type { Sketch } from 'p5-svelte';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const puff: Writable<Sketch | undefined> = writable();

export const download: Writable<Function | undefined> = writable();

export const canvasDimensions: Writable<[x: number, y: number]> = writable([1, 1]);
