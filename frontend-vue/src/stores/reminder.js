import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useReminderStore = defineStore('reminder', () => {
  // State
  const reminders = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const activeReminders = computed(() => 
    reminders.value.filter(r => r.status === 'active')
  )
  const overdueReminders = computed(() => 
    reminders.value.filter(r => 
      r.status === 'active' && new Date(r.dueDate) < new Date()
    )
  )
  const upcomingReminders = computed(() => 
    reminders.value.filter(r => 
      r.status === 'active' && new Date(r.dueDate) >= new Date()
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  )

  // Actions
  const fetchReminders = async (vehicleId) => {
    // Implementation will be added in later tasks
    console.log('Fetch reminders action placeholder', vehicleId)
  }

  const createReminder = async (data) => {
    // Implementation will be added in later tasks
    console.log('Create reminder action placeholder', data)
  }

  const updateReminder = async (id, data) => {
    // Implementation will be added in later tasks
    console.log('Update reminder action placeholder', id, data)
  }

  const deleteReminder = async (id) => {
    // Implementation will be added in later tasks
    console.log('Delete reminder action placeholder', id)
  }

  const markCompleted = async (id) => {
    // Implementation will be added in later tasks
    console.log('Mark reminder completed action placeholder', id)
  }

  return {
    // State
    reminders,
    isLoading,
    error,
    // Getters
    activeReminders,
    overdueReminders,
    upcomingReminders,
    // Actions
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markCompleted
  }
})