<script setup lang="ts">
/**
 * Confirmation for destructive actions. Rendered once per action site;
 * opens via v-model, emits `confirm` when the user accepts.
 */
const open = defineModel<boolean>({ default: false });

withDefaults(
  defineProps<{
    title: string;
    message: string;
    confirmText?: string;
  }>(),
  { confirmText: "Confirm" },
);

const emit = defineEmits<{ (e: "confirm"): void }>();

function onConfirm() {
  open.value = false;
  emit("confirm");
}
</script>

<template>
  <v-dialog v-model="open" max-width="420">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text class="text-body-2">{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="open = false">Cancel</v-btn>
        <v-btn color="error" variant="flat" @click="onConfirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
