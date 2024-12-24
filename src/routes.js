import { createRouter, createWebHistory } from "vue-router";
import { supabase } from './supabase'
import DashboardCt from './components/DashboardCt.vue';
import ProposalCt from './components/ProposalCt.vue';
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
    path: '/proposals',
    name: 'Proposals',
    component: ProposalCt,
    meta: { requiresAuth: true }
  },
  {
    path: '/proposal/:id',
    name: 'ProposalDetail',
    component: ProposalDetail,
    //meta: { requiresAuth: true }
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
