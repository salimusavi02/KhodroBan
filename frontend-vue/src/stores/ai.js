import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAIStore = defineStore('ai', () => {
  // State
  const chatHistory = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentConsultation = ref(null)

  // Getters
  const recentConsultations = computed(() => 
    chatHistory.value
      .filter(item => item.type === 'consultation')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
  )

  // Actions
  const sendMessage = async (message) => {
    // Implementation will be added in later tasks
    console.log('Send AI message action placeholder', message)
  }

  const startConsultation = async (problemDescription) => {
    // Implementation will be added in later tasks
    console.log('Start AI consultation action placeholder', problemDescription)
  }

  const convertToService = async (recommendation) => {
    // Implementation will be added in later tasks
    console.log('Convert AI recommendation to service action placeholder', recommendation)
  }

  const convertToReminder = async (recommendation) => {
    // Implementation will be added in later tasks
    console.log('Convert AI recommendation to reminder action placeholder', recommendation)
  }

  const clearHistory = () => {
    chatHistory.value = []
  }

  return {
    // State
    chatHistory,
    isLoading,
    error,
    currentConsultation,
    // Getters
    recentConsultations,
    // Actions
    sendMessage,
    startConsultation,
    convertToService,
    convertToReminder,
    clearHistory
  }
})