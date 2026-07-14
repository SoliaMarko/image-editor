<script setup lang="ts">
import { ref } from "vue";
import { useEditorStore } from "./stores/editor";
import ImageUploader from "./components/ImageUploader.vue";
import EditorCanvas from "./components/EditorCanvas.vue";
import ControlsPanel from "./components/ControlsPanel.vue";
import CropDialog from "./components/CropDialog.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";

const store = useEditorStore();
const cropOpen = ref(false);
const replaceConfirmOpen = ref(false);
const replaceInput = ref<HTMLInputElement | null>(null);

/** Only ask for confirmation when there are edits to lose. */
function requestReplace() {
  if (store.hasEdits) replaceConfirmOpen.value = true;
  else replaceInput.value?.click();
}

function onReplace(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) store.loadImage(file);
  input.value = "";
}
</script>

<template>
  <v-app>
    <v-app-bar flat density="comfortable">
      <v-app-bar-title class="font-weight-medium">
        <v-icon icon="mdi-image-edit-outline" class="mr-2" color="primary" />
        Image Editor
      </v-app-bar-title>
      <template #append>
        <v-btn
          v-if="store.hasImage"
          variant="text"
          prepend-icon="mdi-image-sync-outline"
          @click="requestReplace"
        >
          Open another image
        </v-btn>
        <input
          ref="replaceInput"
          type="file"
          accept="image/*"
          class="d-none"
          @change="onReplace"
        />
        <ConfirmDialog
          v-model="replaceConfirmOpen"
          title="Open another image?"
          message="Your current edits will be lost when a new image is loaded."
          confirm-text="Open image"
          @confirm="replaceInput?.click()"
        />
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-6">
        <ImageUploader v-if="!store.hasImage" />

        <v-row v-else>
          <v-col cols="12" md="8" lg="9">
            <EditorCanvas />
          </v-col>
          <v-col cols="12" md="4" lg="3">
            <ControlsPanel @open-crop="cropOpen = true" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <CropDialog v-model="cropOpen" />
  </v-app>
</template>
