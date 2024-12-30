import { createRouter, createWebHistory } from "vue-router";
import { supabase } from './supabase'
import DashboardCt from './components/DashboardCt.vue';
import CallbackPage from './components/CallbackPage.vue';
import ProposalDetail from './components/ProposalDetail.vue';
import Login from './components/Login.vue';


const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardCt
  },
  {
    path: '/proposal/:id',
    name: 'ProposalDetail',
    component: ProposalDetail,
    //meta: { requiresAuth: true }
  },  
  {
    path: '/callback',
    name: 'Callback',
    component: CallbackPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('./components/PrivacyPolicy.vue')
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: () => import('./components/TermsOfService.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.meta.requiresGuest && user) {
    next('/proposal')
  } else {
    next()
  }
})

export default router;
