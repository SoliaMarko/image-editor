<script setup lang="ts">
import Cropper from "cropperjs";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useEditorStore } from "../stores/editor";

const store = useEditorStore();
const open = defineModel<boolean>({ default: false });

const imgEl = ref<HTMLImageElement | null>(null);
let cropper: Cropper | null = null;

/**
 * The cropper always runs on the ORIGINAL image and returns coordinates
 * in original-image pixels. We store those coordinates as a crop op —
 * no pixels are ever cut out of the source.
 */
watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    if (!imgEl.value) return;
    cropper = new Cropper(imgEl.value, {
      viewMode: 1,
      autoCropArea: 1,
      background: false,
      ready() {
        // Restore the existing crop so editing it is non-destructive too.
        const existing = store.cropOp;
        if (existing && cropper) {
          cropper.setData({
            x: existing.x,
            y: existing.y,
            width: existing.width,
            height: existing.height,
          });
        }
      },
    });
  } else {
    destroyCropper();
  }
});

function destroyCropper() {
  cropper?.destroy();
  cropper = null;
}

function apply() {
  if (!cropper) return;
  const data = cropper.getData(true); // true = rounded values
  store.setCrop({
    x: Math.max(0, data.x),
    y: Math.max(0, data.y),
    width: data.width,
    height: data.height,
  });
  open.value = false;
}

function removeCrop() {
  store.clearCrop();
  open.value = false;
}

onBeforeUnmount(destroyCropper);
</script>

<template>
  <v-dialog v-model="open" max-width="900">
    <v-card v-if="store.originalImage">
      <v-card-title>Crop</v-card-title>
      <v-card-text>
        <div class="crop-wrap">
          <img
            ref="imgEl"
            :src="store.originalImage.src"
            alt="Image to crop"
            class="crop-img"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          v-if="store.cropOp"
          color="error"
          variant="text"
          @click="removeCrop"
        >
          Remove crop
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="open = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="apply">Apply crop</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.crop-wrap {
  max-height: 60vh;
}
.crop-img {
  display: block;
  max-width: 100%;
}
</style>
