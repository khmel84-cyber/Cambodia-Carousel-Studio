import {cp, mkdir} from 'node:fs/promises';
const target = new URL('../public/ffmpeg/', import.meta.url);
await mkdir(target, {recursive:true});
await cp(new URL('../node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js', import.meta.url), new URL('ffmpeg-core.js',target));
await cp(new URL('../node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm', import.meta.url), new URL('ffmpeg-core.wasm',target));
for (const name of ['worker.js','const.js','errors.js']) await cp(new URL(`../node_modules/@ffmpeg/ffmpeg/dist/esm/${name}`,import.meta.url),new URL(name,target));
