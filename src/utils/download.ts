import type { Operation, OperationsDocument } from "../types/operations";
import { renderToCanvas } from "./render";

function triggerDownload(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

/**
 * Exports at the full resolution of the (cropped) original.
 */
export async function exportImage(
  original: HTMLImageElement,
  ops: Operation[],
  baseName: string,
): Promise<void> {
  const canvas = document.createElement("canvas");
  renderToCanvas(original, ops, canvas);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Export failed: could not encode the image.");

  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${baseName}-edited.png`);
  URL.revokeObjectURL(url);
}

/** Exports the operations document so the result can be reproduced from the original. */
export function exportOperationsJson(
  doc: OperationsDocument,
  baseName: string,
): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${baseName}-operations.json`);
  URL.revokeObjectURL(url);
}
