<script setup lang="ts">
import { computed, ref } from "vue";
import { useEditorStore } from "../stores/editor";
import { NEUTRAL_ADJUST } from "../types/operations";
import type { FilterOp } from "../types/operations";
import { exportImage, exportOperationsJson } from "../utils/download";
import ConfirmDialog from "./ConfirmDialog.vue";

const store = useEditorStore();
const emit = defineEmits<{ (e: "open-crop"): void }>();

const resetConfirmOpen = ref(false);

const exporting = ref(false);
const exportError = ref<string | null>(null);

/**
 * Sliders are two-way bound to the store's adjust op through computed
 * proxies: reading falls back to neutral, writing upserts the op.
 * The sliders never own the state — the ops array does.
 */
function adjustProxy(key: keyof typeof NEUTRAL_ADJUST) {
  return computed({
    get: () => store.adjustOp?.[key] ?? 0,
    set: (value: number) => {
      store.setAdjust({
        ...NEUTRAL_ADJUST,
        ...(store.adjustOp ?? {}),
        [key]: value,
      });
    },
  });
}

const brightness = adjustProxy("brightness");
const contrast = adjustProxy("contrast");
const saturation = adjustProxy("saturation");

const filter = computed<FilterOp["name"] | null>({
  get: () => store.filterOp?.name ?? null,
  set: (name) => store.setFilter(name),
});

const cropLabel = computed(() =>
  store.cropOp ? `${store.cropOp.width} × ${store.cropOp.height}` : null,
);

async function onExportImage() {
  if (!store.originalImage) return;
  exporting.value = true;
  exportError.value = null;
  try {
    await exportImage(store.originalImage, store.ops, store.fileName);
  } catch (e) {
    exportError.value = e instanceof Error ? e.message : "Export failed.";
  } finally {
    exporting.value = false;
  }
}

function onExportJson() {
  exportOperationsJson(store.toDocument(), store.fileName);
}
</script>

<template>
  <v-card flat class="pa-2">
    <v-card-item>
      <v-card-title class="text-subtitle-1">Crop</v-card-title>
    </v-card-item>
    <v-card-text class="d-flex align-center ga-3">
      <v-btn prepend-icon="mdi-crop" variant="tonal" @click="emit('open-crop')">
        {{ store.cropOp ? "Edit crop" : "Crop image" }}
      </v-btn>
      <span v-if="cropLabel" class="text-body-2 text-medium-emphasis">
        {{ cropLabel }} px
      </span>
    </v-card-text>

    <v-divider class="my-2" />

    <v-card-item>
      <v-card-title class="text-subtitle-1">Adjustments</v-card-title>
    </v-card-item>
    <v-card-text>
      <v-slider
        v-model="brightness"
        label="Brightness"
        :min="-100"
        :max="100"
        :step="1"
        thumb-label
        color="primary"
        hide-details
        class="mb-3"
      />
      <v-slider
        v-model="contrast"
        label="Contrast"
        :min="-100"
        :max="100"
        :step="1"
        thumb-label
        color="primary"
        hide-details
        class="mb-3"
      />
      <v-slider
        v-model="saturation"
        label="Saturation"
        :min="-100"
        :max="100"
        :step="1"
        thumb-label
        color="primary"
        hide-details
      />
    </v-card-text>

    <v-divider class="my-2" />

    <v-card-item>
      <v-card-title class="text-subtitle-1">Filter</v-card-title>
    </v-card-item>
    <v-card-text>
      <v-btn-toggle v-model="filter" color="primary" variant="outlined" divided>
        <v-btn value="grayscale">Greyscale</v-btn>
        <v-btn value="sepia">Sepia</v-btn>
      </v-btn-toggle>
    </v-card-text>

    <v-divider class="my-2" />

    <v-card-text class="d-flex flex-column ga-2">
      <v-btn
        variant="tonal"
        prepend-icon="mdi-eye-outline"
        :disabled="!store.hasEdits"
        @mousedown="store.showOriginal = true"
        @mouseup="store.showOriginal = false"
        @mouseleave="store.showOriginal = false"
        @keydown.space.prevent="store.showOriginal = true"
        @keyup.space="store.showOriginal = false"
      >
        Hold to view original
      </v-btn>
      <v-btn
        variant="text"
        color="error"
        prepend-icon="mdi-restore"
        :disabled="!store.hasEdits"
        @click="resetConfirmOpen = true"
      >
        Reset all edits
      </v-btn>
      <ConfirmDialog
        v-model="resetConfirmOpen"
        title="Reset all edits?"
        message="Crop, adjustments, and filters will be removed. The original image stays loaded."
        confirm-text="Reset"
        @confirm="store.reset()"
      />
    </v-card-text>

    <v-divider class="my-2" />

    <v-card-text class="d-flex flex-column ga-2">
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-download"
        :loading="exporting"
        @click="onExportImage"
      >
        Download image
      </v-btn>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-code-json"
        @click="onExportJson"
      >
        Download operations JSON
      </v-btn>
      <v-alert
        v-if="exportError"
        type="error"
        variant="tonal"
        density="compact"
        :text="exportError"
      />
    </v-card-text>
  </v-card>
</template>
