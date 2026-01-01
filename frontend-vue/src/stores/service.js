import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { serviceService } from '../services'

export const useServiceStore = defineStore('service', () => {
  // State
  const services = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const servicesByVehicle = computed(() => (vehicleId) => 
    services.value.filter(s => s.vehicleId === vehicleId)
  )
  const recentServices = computed(() => 
    services.value
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  )
  const totalServiceCost = computed(() => 
    services.value.reduce((total, service) => total + (service.cost || 0), 0)
  )

  // Actions
  const fetchServices = async (vehicleId) => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await serviceService.getAll(vehicleId)
      services.value = data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createService = async (data) => {
    isLoading.value = true
    error.value = null
    
    try {
      const newService = await serviceService.create(data)
      services.value.unshift(newService)
      return newService
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateService = async (id, data) => {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedService = await serviceService.update(id, data)
      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value[index] = updatedService
      }
      return updatedService
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteService = async (id) => {
    isLoading.value = true
    error.value = null
    
    try {
      await serviceService.delete(id)
      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getServiceById = (id) => {
    return services.value.find(s => s.id === id)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    services,
    isLoading,
    error,
    // Getters
    servicesByVehicle,
    recentServices,
    totalServiceCost,
    // Actions
    fetchServices,
    createService,
    updateService,
    deleteService,
    getServiceById,
    clearError
  }
})