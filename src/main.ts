import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import "cropperjs/dist/cropper.css";
import App from "./App.vue";

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        dark: true,
        colors: {
          background: "#161514",
          surface: "#201E1C",
          primary: "#E8A33D",
          secondary: "#8A8578",
          error: "#E5604C",
        },
      },
    },
  },
});

createApp(App).use(createPinia()).use(vuetify).mount("#app");
