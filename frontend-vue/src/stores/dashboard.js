import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useVehicleStore } from './vehicle'
import { useServiceStore } from './service'
import { useReminderStore } from './reminder'
import { useExpenseStore } from './expense'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const isLoading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // Get other stores
  const vehicleStore = useVehicleStore()
  const serviceStore = useServiceStore()
  const reminderStore = useReminderStore()
  const expenseStore = useExpenseStore()

  // Getters
  const dashboardSummary = computed(() => ({
    totalVehicles: vehicleStore.vehicleCount,
    totalExpenses: expenseStore.totalExpenses,
    activeReminders: reminderStore.activeReminders.length,
    overdueReminders: reminderStore.overdueReminders.length,
    recentServices: serviceStore.recentServices,
    upcomingReminders: reminderStore.upcomingReminders.slice(0, 3)
  }))

  const quickStats = computed(() => ({
    thisMonthExpenses: 0, // Will be calculated from expense data
    servicesThisMonth: 0, // Will be calculated from service data
    avgMonthlyExpense: 0, // Will be calculated from historical data
    nextServiceDue: null // Will be calculated from reminder data
  }))

  // Actions
  const refreshDashboard = async () => {
    // Implementation will be added in later tasks
    console.log('Refresh dashboard action placeholder')
  }

  const fetchDashboardData = async () => {
    // Implementation will be added in later tasks
    console.log('Fetch dashboard data action placeholder')
  }

  return {
    // State
    isLoading,
    error,
    lastUpdated,
    // Getters
    dashboardSummary,
    quickStats,
    // Actions
    refreshDashboard,
    fetchDashboardData
  }
})