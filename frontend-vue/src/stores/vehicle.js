import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVehicleStore = defineStore('vehicle', () => {
  // State
  const vehicles = ref([])
  const selectedVehicle = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const vehicleCount = computed(() => vehicles.value.length)
  const vehicleById = computed(() => (id) => vehicles.value.find(v => v.id === id))

  // Actions
  const fetchVehicles = async () => {
    // Implementation will be added in later tasks
    console.log('Fetch vehicles action placeholder')
  }

  const createVehicle = async (data) => {
    // Implementation will be added in later tasks
    console.log('Create vehicle action placeholder', data)
  }

  const updateVehicle = async (id, data) => {
    // Implementation will be added in later tasks
    console.log('Update vehicle action placeholder', id, data)
  }

  const deleteVehicle = async (id) => {
    // Implementation will be added in later tasks
    console.log('Delete vehicle action placeholder', id)
  }

  const selectVehicle = (id) => {
    selectedVehicle.value = vehicleById.value(id)
  }

  return {
    // State
    vehicles,
    selectedVehicle,
    isLoading,
    error,
    // Getters
    vehicleCount,
    vehicleById,
    // Actions
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    selectVehicle
  }
})