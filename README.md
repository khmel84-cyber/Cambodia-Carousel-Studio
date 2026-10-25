# Cambodia Carousel Studio

Four editable React/SVG carousel slides based on the supplied visual reference.
Every composition is 1080 × 1350, 30 FPS, 60 frames (2 seconds).
Headings, body copy, slide numbers, feature icons, CTA, line and house are separate
HTML/SVG layers. Photographs are generated approximations without baked-in text;
the fourth portrait is temporary, not the author's real photo.

## Preview

```
npm ci
npm run preview
```

Select 01–04, then press «Воспроизвести». The player loops the current slide.
The upload panel replaces the current photo in browser memory; nothing is uploaded.
Clean portrait photos work best at 1080 × 1350. Changes disappear on reload.

`npm run studio` opens the four compositions in Remotion Studio.
`npm run typecheck` checks TypeScript. `npm run build:preview` builds the static site.

## Layout and motion

- `src/Carousel.tsx`: four layouts and motion paths, shared original house.
- `src/SlideTwo.tsx`: preserved original second-slide path and earlier composition.
- `src/preview.tsx`: mobile tabs, playback and temporary image replacement.
- `public/photos/reference-backgrounds.png`: clean generated photographic asset sheet.

The original second-slide curve is uniformly scaled and translated to the bottom
of its layout, without changing its control-point geometry. Slides 1/2 enter and
leave in 1.8 seconds; slide 3 stops near the papers on its last frame; slide 4
finishes at frame 45 and holds for 15 frames. All text and photos are stationary.

## GitHub Pages

`.github/workflows/pages.yml` builds and deploys on pushes to `main`.
Repository Settings → Pages → Source must be **GitHub Actions**.
On iPhone open Actions → Publish slide two preview → latest run and check its status.
After a successful deploy open:
https://khmel84-cyber.github.io/Cambodia-Carousel-Studio/

The site plays animation in the browser; it does not export video.
The export buttons generate four individual silent H.264 MP4 files on demand.
Building or deploying the site does not generate MP4 files.

## Local MP4 export on iPhone

«Скачать MP4» prepares the selected slide. «Скачать все 4 видео» prepares four
individual videos sequentially, without a ZIP. Each result has an actual MP4
preview, a Save/share button and a download link. In Safari use Save → Save Video
(or Save to Files). Four-file export intentionally leaves four Save buttons:
Safari may block multiple automatic downloads and requires a user gesture to share.

Output is 1080 × 1350, H.264 AVC, yuv420p in the software path, 30 FPS, exactly 60
frames / 2 seconds, no audio track. The MP4 container is parsed and checked for AVC, dimensions, duration,
60 packets / 30 FPS, and absence of audio before it is offered for download.
This validation does not depend on Safari autoplay permissions. Keep Safari in the foreground.

Photographs are stored as Blobs in IndexedDB, never uploaded. Old releases stored
photos only in page memory: those cannot be recovered after that page reloads.
They must be selected once more. Private browsing or clearing site data can remove
stored photographs. The UI explicitly identifies when a sample photo is being used.

`src/exportVideo.tsx` captures the static photo/HTML/SVG layers once at native
resolution with html2canvas, then draws the shared original `House` using the same
`getHousePose()` as Remotion for frames 0–59. It does not record a real-time player,
so background throttling cannot silently create dropped-frame recordings.

The preferred codec is the device's WebCodecs AVC encoder through Mediabunny.
When unavailable or failing, a single-thread FFmpeg WebAssembly worker encodes
with libx264. This works without a render server, cross-origin isolation headers,
or access to local photos from GitHub. The approximately 32 MB encoder downloads
from the same Pages site only when needed. On older phones export one slide at a
time if the browser runs out of memory; errors do not produce fake MP4 files.

`npm ci` / `npm run build:preview` copies the pinned FFmpeg worker/core into ignored
`public/ffmpeg/`; the Pages workflow publishes these generated files with the site.
`?software-export` forces the fallback for reproducible validation.

Validation performed in Chromium at a mobile viewport with four uploaded test
photographs: IndexedDB recovery after reload, four real software-encoded videos,
ffprobe verification of codec/size/FPS/frame count/duration/no audio, decoded frame
checks for each distinct uploaded image, text and house motion, and the final hold
on slide 4. Physical iPhone/Safari validation is still required on the target device.

FFmpeg.wasm core includes FFmpeg and libx264. Their respective license/source
information is available at https://github.com/ffmpegwasm/ffmpeg.wasm and
https://github.com/ffmpegwasm/ffmpeg.wasm/tree/main/packages/core.
