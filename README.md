# Image Editor

A small browser-based image editor. Non-destructive: the file you upload is never modified.

Built with Vue 3, Vuetify 3, Pinia and TypeScript.

## Run

```bash
npm i && npm run dev
```

## How it works

The whole app state lives in one Pinia store and it's just two things:

- `originalImage`, the image you uploaded, which stays untouched for the entire session
- `ops`, a plain array describing every edit you've made

Nothing else is stored. What you see in the preview is simply the original image with the ops replayed on top of it, recomputed whenever the ops change.

The pipeline runs in a fixed order: first the crop, then the adjustments (brightness, contrast, saturation), then the filter, and the result goes to the canvas.

All of that lives in `renderToCanvas()` (`src/utils/render.ts`). It's a pure function and it doesn't know anything about Vue. The same function draws the live preview, produces the full-resolution export, and replays an ops file you feed back in, so those three can never drift apart.

The operations themselves are a discriminated union (`src/types/operations.ts`):

```ts
type Operation =
  | { type: "crop"; x; y; width; height } // pixel coords on the original image
  | { type: "adjust"; brightness; contrast; saturation } // -100..100, 0 is neutral
  | { type: "filter"; name: "grayscale" | "sepia" };
```

## Decisions I'd defend

**Operations are data, not pixels.** A crop stores coordinates, not a cropped bitmap. A slider stores its value, not baked-in pixels. This means non-destructiveness isn't something I have to remember to preserve, it's just how the model works. Reset is `ops = []`, and exporting the edit history is `JSON.stringify(ops)`, so the bonus task came almost for free.

**Adjust is replaced, not appended.** Moving a slider overwrites the existing `adjust` op instead of pushing a new one, so dragging around doesn't grow the list and there's at most one op of each type. If all three values are back at zero, the op is dropped entirely, which keeps the exported JSON clean.

**Pipeline order is decided by the renderer, not by array order.** Crop always happens before the colour work. For this scope that's simpler and more predictable. If the app ever needed reorderable layers, the order would have to be stored explicitly.

**The preview canvas keeps full resolution and is only scaled down with CSS.** Export draws into a fresh offscreen canvas through the same pipeline, never by reading pixels back from the visible one, so you always get the full resolution of the (cropped) original. Silently downscaling someone's export is the bug I least wanted to ship, especially if the images are headed for print.

**"Hold to view original" and Reset are different things.** Peeking at the source just renders with no ops applied and keeps your edits; Reset throws them away. Users mean different things by those two, so they're separate.

## Trade-offs

**`ctx.filter` instead of hand-written `ImageData` math.** Canvas filters are hardware-accelerated, they're one line of code, and preview and export get identical results for free. The downside is coarser numeric control than a custom LUT or convolution, and a dependency on browser support (fine everywhere modern). If per-pixel precision mattered, say for print colour profiles, I'd swap the renderer for `ImageData` or WebGL and keep the ops model exactly as it is.

**cropperjs for the crop UI.** Interactive crop selection is a solved problem and not the interesting part of this task. What matters is that the app only keeps the coordinates it hands back.

**PNG export.** Lossless and simple. A format and quality picker would be an obvious next step.

## Bonus features

Two filters, greyscale and sepia. Each one is just a `filter` op and one extra term in the filter string.

The operations log can be exported as JSON: `{ version: 1, createdAt, ops }`. The `version` field is there so the format can change later without breaking files people already saved. Replaying is running those ops back through `renderToCanvas(original, ops)`, so there's no separate replay code to maintain.

## Not built, but the model has room for it

Undo/redo would be a pointer into a history of ops snapshots. A new operation like rotate or resize is one more member of the union and one more branch in the renderer. And because the ops document is just JSON, it could be sent to a server to re-render the image at print resolution.
