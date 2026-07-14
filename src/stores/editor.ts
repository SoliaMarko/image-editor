import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import type {
  AdjustOp,
  CropOp,
  FilterOp,
  Operation,
  OperationsDocument,
} from "../types/operations";

/**
 * Single source of truth for the editor.
 *
 * State is intentionally tiny: the original image (never mutated)
 * and the list of operations. Everything on screen is derived from
 * these two values.
 */
export const useEditorStore = defineStore("editor", () => {
  const originalImage = shallowRef<HTMLImageElement | null>(null);
  const fileName = ref<string>("image");
  const ops = ref<Operation[]>([]);

  const showOriginal = ref(false);

  /** Ops that the renderer should use right now. */
  const effectiveOps = computed<Operation[]>(() =>
    showOriginal.value ? [] : ops.value,
  );

  const hasImage = computed(() => originalImage.value !== null);
  const hasEdits = computed(() => ops.value.length > 0);

  const cropOp = computed(
    () => ops.value.find((o): o is CropOp => o.type === "crop") ?? null,
  );
  const adjustOp = computed(
    () => ops.value.find((o): o is AdjustOp => o.type === "adjust") ?? null,
  );
  const filterOp = computed(
    () => ops.value.find((o): o is FilterOp => o.type === "filter") ?? null,
  );

  function loadImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (originalImage.value) URL.revokeObjectURL(originalImage.value.src);
        originalImage.value = img;
        fileName.value = file.name.replace(/\.[^.]+$/, "") || "image";
        ops.value = [];
        showOriginal.value = false;
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("The file could not be read as an image."));
      };
      img.src = url;
    });
  }

  function upsert(op: Operation): void {
    const index = ops.value.findIndex((o) => o.type === op.type);
    if (index >= 0) ops.value.splice(index, 1, op);
    else ops.value.push(op);
  }

  function setCrop(rect: Omit<CropOp, "type">): void {
    upsert({ type: "crop", ...rect });
  }

  function clearCrop(): void {
    ops.value = ops.value.filter((o) => o.type !== "crop");
  }

  function setAdjust(values: Omit<AdjustOp, "type">): void {
    const isNeutral =
      values.brightness === 0 &&
      values.contrast === 0 &&
      values.saturation === 0;
    if (isNeutral) {
      ops.value = ops.value.filter((o) => o.type !== "adjust");
    } else {
      upsert({ type: "adjust", ...values });
    }
  }

  function setFilter(name: FilterOp["name"] | null): void {
    if (name === null) {
      ops.value = ops.value.filter((o) => o.type !== "filter");
    } else {
      upsert({ type: "filter", name });
    }
  }

  function reset(): void {
    ops.value = [];
    showOriginal.value = false;
  }

  function toDocument(): OperationsDocument {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      ops: JSON.parse(JSON.stringify(ops.value)),
    };
  }

  return {
    originalImage,
    fileName,
    ops,
    showOriginal,
    effectiveOps,
    hasImage,
    hasEdits,
    cropOp,
    adjustOp,
    filterOp,
    loadImage,
    setCrop,
    clearCrop,
    setAdjust,
    setFilter,
    reset,
    toDocument,
  };
});
