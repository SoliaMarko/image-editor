<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useEditorStore } from "../stores/editor";
import { renderToCanvas } from "../utils/render";

const store = useEditorStore();
const canvasEl = ref<HTMLCanvasElement | null>(null);

/**
 * The preview is derived state: whenever the image or the effective ops
 * change, the canvas is re-rendered from the original. watchEffect tracks
 * both dependencies automatically.
 */
watchEffect(() => {
  const canvas = canvasEl.value;
  const image = store.originalImage;
  if (!canvas || !image) return;
  renderToCanvas(image, store.effectiveOps, canvas);
});
</script>

<template>
  <div class="canvas-stage d-flex align-center justify-center pa-4">
    <canvas ref="canvasEl" class="preview" />
    <v-chip
      v-if="store.showOriginal"
      class="original-badge"
      color="primary"
      size="small"
      variant="flat"
    >
      Original
    </v-chip>
  </div>
</template>

<style scoped>
.canvas-stage {
  position: relative;
  min-height: 60vh;
  background: repeating-conic-gradient(
      rgba(255, 255, 255, 0.04) 0% 25%,
      transparent 0% 50%
    )
    0 0 / 24px 24px;
  border-radius: 12px;
}
/* The canvas keeps the image's full resolution; only its display size is scaled. */
.preview {
  max-width: 100%;
  max-height: 72vh;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}
.original-badge {
  position: absolute;
  top: 16px;
  left: 16px;
}
</style>
