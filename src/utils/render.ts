import type { Operation } from "../types/operations";

/**
 * The render pipeline: original -> crop -> adjustments -> filters -> canvas.
 *
 * A pure function with no Vue dependency. The same function drives the
 * live preview and the full-resolution export, so what you see is what
 * you download. It is also what would replay an exported operations JSON.
 */
export function renderToCanvas(
  original: HTMLImageElement,
  ops: Operation[],
  canvas: HTMLCanvasElement,
): void {
  const crop = ops.find((op) => op.type === "crop");

  const sx = crop?.x ?? 0;
  const sy = crop?.y ?? 0;
  const sw = crop?.width ?? original.naturalWidth;
  const sh = crop?.height ?? original.naturalHeight;

  // The canvas is sized to the source rect: export keeps full resolution.
  canvas.width = Math.max(1, Math.round(sw));
  canvas.height = Math.max(1, Math.round(sh));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = buildFilterString(ops);
  ctx.drawImage(original, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  ctx.filter = "none";
}

/**
 * Collapses adjust + filter ops into a canvas/CSS filter string.
 * Slider values are -100..100 around neutral 0 and map to
 * multiplicative factors: 0 -> 1.0, 100 -> 2.0, -100 -> 0.0.
 */
export function buildFilterString(ops: Operation[]): string {
  const parts: string[] = [];

  for (const op of ops) {
    if (op.type === "adjust") {
      const toFactor = (v: number) => Math.max(0, (100 + v) / 100);
      if (op.brightness !== 0)
        parts.push(`brightness(${toFactor(op.brightness)})`);
      if (op.contrast !== 0) parts.push(`contrast(${toFactor(op.contrast)})`);
      if (op.saturation !== 0)
        parts.push(`saturate(${toFactor(op.saturation)})`);
    } else if (op.type === "filter") {
      if (op.name === "grayscale") parts.push("grayscale(1)");
      if (op.name === "sepia") parts.push("sepia(1)");
    }
  }

  return parts.length > 0 ? parts.join(" ") : "none";
}
