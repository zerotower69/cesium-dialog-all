import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
//use unocss
import 'uno.css';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false;
Vue.use(ElementUI);

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
});
app.$mount('#app');
