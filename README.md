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
Future deliverables are four individual silent H.264 MP4 files. No MP4 rendering
is performed by the preview or deployment workflow.
