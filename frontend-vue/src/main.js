import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { setupErrorHandlers } from './services/errorHandler'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Setup error handlers after Pinia is initialized
setupErrorHandlers()

app.mount('#app')
