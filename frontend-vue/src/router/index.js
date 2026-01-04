import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy load components for better performance
// Critical routes (loaded immediately)
const LoginView = () => import('../views/LoginView.vue')
const AuthCallbackView = () => import('../views/AuthCallbackView.vue')
const SignUpView = () => import('../views/SignUpView.vue')

// Main app routes (lazy loaded)
const DashboardView = () => import('../views/DashboardView.vue')
const VehicleListView = () => import('../views/VehicleListView.vue')
const VehicleDetailsView = () => import('../views/VehicleDetailsView.vue')
const VehicleManagementView = () => import('../views/VehicleManagementView.vue')
const RemindersView = () => import('../views/RemindersView.vue')
const ReportsView = () => import('../views/ReportsView.vue')
const SettingsView = () => import('../views/SettingsView.vue')
const AddServiceView = () => import('../views/AddServiceView.vue')
const SelectServiceTypeView = () => import('../views/SelectServiceTypeView.vue')
const SelectServiceDetailsView = () => import('../views/SelectServiceDetailsView.vue')
const SmartAssistantView = () => import('../views/SmartAssistantView.vue')
const UpgradeProView = () => import('../views/UpgradeProView.vue')

// Variant views (lazy loaded, lower priority)
const DashboardVariant3View = () => import('../views/DashboardVariant3View.vue')
const DashboardVariant16View = () => import('../views/DashboardVariant16View.vue')
const SelectServiceTypeVariant5View = () => import('../views/SelectServiceTypeVariant5View.vue')
const SelectServiceDetailsVariant15View = () => import('../views/SelectServiceDetailsVariant15View.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallbackView
    },
    {
      path: '/select-service',
      name: 'select-service',
      component: SelectServiceTypeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard-variant-3',
      name: 'dashboard-variant-3',
      component: DashboardVariant3View
    },
    {
      path: '/vehicle-management',
      name: 'vehicle-management',
      component: VehicleManagementView
    },
    {
      path: '/select-service-variant-5',
      name: 'select-service-variant-5',
      component: SelectServiceTypeVariant5View
    },
    {
      path: '/reminders',
      name: 'reminders',
      component: RemindersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/select-service-details',
      name: 'select-service-details',
      component: SelectServiceDetailsView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/add-service',
      name: 'add-service',
      component: AddServiceView,
      meta: { requiresAuth: true }
    },
    {
      path: '/vehicle-list',
      name: 'vehicle-list',
      component: VehicleListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      meta: { requiresGuest: true }
    },
    {
      path: '/upgrade-pro',
      name: 'upgrade-pro',
      component: UpgradeProView,
      meta: { requiresAuth: true }
    },
    {
      path: '/select-service-details-variant-15',
      name: 'select-service-details-variant-15',
      component: SelectServiceDetailsVariant15View
    },
    {
      path: '/dashboard-variant-16',
      name: 'dashboard-variant-16',
      component: DashboardVariant16View
    },
    {
      path: '/vehicle-details/:id',
      name: 'vehicle-details',
      component: VehicleDetailsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/smart-assistant',
      name: 'smart-assistant',
      component: SmartAssistantView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth store if not already done
  if (!authStore.user && authStore.token) {
    await authStore.initialize()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route requires guest (redirect to dashboard if already logged in)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
