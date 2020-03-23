import Vue from 'vue'
import Router from 'vue-router'
import home from '@/components/home'
import '../assets/styles/style.css';
import '../assets/styles/theme.css';
import '../assets/styles/bootstrap.min.css';
import '../assets/styles/fontawesome-all.min.css';
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: home
    },
  ]
})