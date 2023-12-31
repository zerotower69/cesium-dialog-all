import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import ElementPlus from 'element-plus';

//use unocss
import 'virtual:uno.css';
import 'element-plus/dist/index.css';
import { setupTrackModel } from '@/components/TrackModel';

const app = createApp(App);
app.use(ElementPlus);
setupTrackModel(app);
app.mount('#app');
