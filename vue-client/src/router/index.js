import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
/**
 * keepAlive 需要缓存的页面
 */
const router =  new Router({
  mode: 'history',
  routes: [
    { 
      path: '/',
      components: ()=> import("../views/index.vue")
    },
    
  ]
});

export default router;