/** Crop in original-image pixel coordinates. */
export interface CropOp {
  type: "crop";
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tonal adjustments. Values are percentages relative to neutral:
 * 0 = unchanged, -100..100. Kept as a single op that is replaced
 * (not appended) when a slider moves, so dragging a slider is idempotent.
 */
export interface AdjustOp {
  type: "adjust";
  brightness: number;
  contrast: number;
  saturation: number;
}

/** Stylistic filter, applied at full strength. */
export interface FilterOp {
  type: "filter";
  name: "grayscale" | "sepia";
}

export type Operation = CropOp | AdjustOp | FilterOp;

/** Shape of the exported JSON document. */
export interface OperationsDocument {
  version: 1;
  createdAt: string;
  ops: Operation[];
}

export const NEUTRAL_ADJUST: Omit<AdjustOp, "type"> = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
};
