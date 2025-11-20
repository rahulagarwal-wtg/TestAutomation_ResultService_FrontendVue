  // src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import Summary from '../components/Summary.vue'
import ModuleDetails from '../components/ModuleDetails.vue'
import Failures from '../components/Failures.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: 'Dashboard' }
    },
    {
      path: '/summary/:server/:runType/:branch/:buildNumber',
      name: 'summary',
      component: Summary,
      meta: { title: 'Test Run Summary' }
    },
    {
      path: '/module-details/:server/:runType/:branch/:buildNumber/:module',
      name: 'module-details',
      component: ModuleDetails,
      meta: { title: 'Module Details' }
    },
    {
      path: '/failures/:server/:runType/:branch/:buildNumber',
      name: 'failures',
      component: Failures,
      meta: { title: 'Failure Analysis' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
})

// Navigation guard to update page title
router.beforeEach((to, from, next) => {
  document.title = to.meta.title 
    ? `${to.meta.title as string} - Test Automation`
    : 'Test Automation Dashboard'
  next()
})

export default router