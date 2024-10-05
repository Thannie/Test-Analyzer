/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import vuePugPlugin from 'vue-pug-plugin'
import { createPinia } from 'pinia'
const pinia = createPinia()
import VueApexCharts from "vue3-apexcharts";


// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)
registerPlugins(app)

app
    .use(VueApexCharts)
    .use(pinia)
    .use(vuePugPlugin)

app.mount('#app')