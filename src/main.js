/*
 * file: main.js
 * author: Nozdrin-Plotnitsky Nikalay <nozrin.plotnitsky@gmail.com>
 * license: MIT
 */

import Vue from 'vue'
import App from './App.vue'
import './plugins/buefy'
import './plugins/karma'
import './plugins/lodash'
import './plugins/axios'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
