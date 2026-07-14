<script setup lang="ts">
import { ref } from "vue";
import { useEditorStore } from "../stores/editor";

const store = useEditorStore();
const fileInput = ref<HTMLInputElement | null>(null);
const dragOver = ref(false);
const error = ref<string | null>(null);

async function handleFile(file: File | undefined | null) {
  if (!file) return;
  error.value = null;
  if (!file.type.startsWith("image/")) {
    error.value = "Only image files can be opened.";
    return;
  }
  try {
    await store.loadImage(file);
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "The image could not be loaded.";
  }
}

function onDrop(event: DragEvent) {
  dragOver.value = false;
  handleFile(event.dataTransfer?.files?.[0]);
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement;
  handleFile(input.files?.[0]);
  input.value = "";
}
</script>

<template>
  <div
    class="uploader d-flex flex-column align-center justify-center pa-12"
    :class="{ 'uploader--active': dragOver }"
    role="button"
    tabindex="0"
    @click="fileInput?.click()"
    @keydown.enter="fileInput?.click()"
    @dragover.prevent="dragOver = true"
    @dragleave="dragOver = false"
    @drop.prevent="onDrop"
  >
    <v-icon
      icon="mdi-image-plus-outline"
      size="56"
      color="primary"
      class="mb-4"
    />
    <div class="text-h6 mb-1">Drop an image here</div>
    <div class="text-body-2 text-medium-emphasis">
      or click to choose a file
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="compact"
      class="mt-6"
      :text="error"
    />

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="d-none"
      @change="onPick"
    />
  </div>
</template>

<style scoped>
.uploader {
  min-height: 60vh;
  border: 2px dashed rgba(var(--v-theme-secondary), 0.5);
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}
.uploader:hover,
.uploader--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.06);
}
</style>
