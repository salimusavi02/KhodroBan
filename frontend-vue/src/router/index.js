import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import SelectServiceTypeView from '../views/SelectServiceTypeView.vue'
import DashboardVariant3View from '../views/DashboardVariant3View.vue'
import VehicleManagementView from '../views/VehicleManagementView.vue'
import SelectServiceTypeVariant5View from '../views/SelectServiceTypeVariant5View.vue'
import RemindersView from '../views/RemindersView.vue'
import SelectServiceDetailsView from '../views/SelectServiceDetailsView.vue'
import SettingsView from '../views/SettingsView.vue'
import AddServiceView from '../views/AddServiceView.vue'
import VehicleListView from '../views/VehicleListView.vue'
import ReportsView from '../views/ReportsView.vue'
import SignUpView from '../views/SignUpView.vue'
import UpgradeProView from '../views/UpgradeProView.vue'
import SelectServiceDetailsVariant15View from '../views/SelectServiceDetailsVariant15View.vue'
import DashboardVariant16View from '../views/DashboardVariant16View.vue'
import VehicleDetailsView from '../views/VehicleDetailsView.vue'
import SmartAssistantView from '../views/SmartAssistantView.vue'
import AuthCallbackView from '../views/AuthCallbackView.vue'

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
      path: '/vehicle-details',
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
