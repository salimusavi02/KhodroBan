<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useServiceStore } from '../stores/service'
import { useVehicleStore } from '../stores/vehicle'
import { useToast } from '../composables/useToast'
import Modal from '../components/ui/Modal.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const serviceStore = useServiceStore()
const vehicleStore = useVehicleStore()
const toast = useToast()

// State
const services = ref([])
const isLoading = ref(false)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const serviceToDelete = ref(null)
const serviceToEdit = ref(null)
const selectedVehicleId = ref(null)

// Edit form
const editForm = ref({
  date: '',
  km: '',
  cost: '',
  type: '',
  note: ''
})

const editFormErrors = ref({})

// Service type options
const serviceTypes = computed(() => [
  { value: 'oil_change', label: t('services.types.oil_change') },
  { value: 'filter', label: t('services.types.filter') },
  { value: 'brakes', label: t('services.types.brakes') },
  { value: 'battery', label: t('services.types.battery') },
  { value: 'tire', label: t('services.types.tire') },
  { value: 'other', label: t('services.types.other') }
])

// Computed
const selectedVehicle = computed(() => {
  if (!selectedVehicleId.value) return null
  // Compare as strings to handle both string and number IDs
  return vehicleStore.vehicles.find(v => String(v.id) === String(selectedVehicleId.value))
})

const filteredServices = computed(() => {
  // If a vehicle is selected, show only its services
  if (selectedVehicleId.value) {
    // Use servicesByVehicle which filters by vehicleId
    const vehicleServices = serviceStore.servicesByVehicle(selectedVehicleId.value)
    return vehicleServices
  }
  // Otherwise show all services (no filter)
  return serviceStore.services
})

// Methods
const fetchServices = async () => {
  isLoading.value = true
  try {
    await serviceStore.fetchServices(selectedVehicleId.value || undefined)
    services.value = serviceStore.services
  } catch (error) {
    console.error('Error fetching services:', error)
    toast.error(t('services.add.error'))
  } finally {
    isLoading.value = false
  }
}

const handleEdit = (service) => {
  serviceToEdit.value = service
  editForm.value = {
    date: service.date || '',
    km: service.km?.toString() || '',
    cost: service.cost?.toString() || '',
    type: service.type || '',
    note: service.note || ''
  }
  editFormErrors.value = {}
  showEditModal.value = true
}

const handleDelete = (service) => {
  serviceToDelete.value = service
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  if (!serviceToDelete.value) return
  
  try {
    await serviceStore.deleteService(serviceToDelete.value.id)
    toast.success(t('services.delete.success'))
    showDeleteModal.value = false
    serviceToDelete.value = null
    await fetchServices()
  } catch (error) {
    console.error('Error deleting service:', error)
    toast.error(t('services.delete.error'))
  }
}

const handleDeleteCancel = () => {
  showDeleteModal.value = false
  serviceToDelete.value = null
}

const validateEditForm = () => {
  const errors = {}
  
  if (!editForm.value.date) {
    errors.date = t('services.add.validation.dateRequired')
  }
  
  if (!editForm.value.km || editForm.value.km <= 0) {
    errors.km = t('services.add.validation.kmRequired')
  } else if (isNaN(parseInt(editForm.value.km))) {
    errors.km = t('services.add.validation.kmInvalid')
  }
  
  if (!editForm.value.cost || editForm.value.cost <= 0) {
    errors.cost = t('services.add.validation.costRequired')
  } else if (isNaN(parseInt(editForm.value.cost))) {
    errors.cost = t('services.add.validation.costInvalid')
  }
  
  if (!editForm.value.type) {
    errors.type = t('services.add.validation.typeRequired')
  }
  
  editFormErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleEditSubmit = async () => {
  if (!validateEditForm() || !serviceToEdit.value) return
  
  try {
    await serviceStore.updateService(serviceToEdit.value.id, {
      date: editForm.value.date,
      km: parseInt(editForm.value.km),
      cost: parseInt(editForm.value.cost),
      type: editForm.value.type,
      note: editForm.value.note || undefined
    })
    
    toast.success(t('services.edit.success'))
    showEditModal.value = false
    serviceToEdit.value = null
    await fetchServices()
  } catch (error) {
    console.error('Error updating service:', error)
    toast.error(t('services.edit.error'))
  }
}

const handleEditCancel = () => {
  showEditModal.value = false
  serviceToEdit.value = null
  editForm.value = {
    date: '',
    km: '',
    cost: '',
    type: '',
    note: ''
  }
  editFormErrors.value = {}
}

const handleBack = () => {
  router.back()
}

const formatDate = (date) => {
  if (!date) return ''
  return date
}

const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('fa-IR').format(amount)
}

// Methods for vehicle selection
const handleVehicleChange = (vehicleId) => {
  selectedVehicleId.value = vehicleId || null
  // Update route query without navigation
  if (vehicleId) {
    router.replace({ query: { ...route.query, vehicleId } })
  } else {
    const { vehicleId: _, ...rest } = route.query
    router.replace({ query: rest })
  }
  // Fetch services for the selected vehicle or all services
  fetchServices()
}

// Lifecycle
onMounted(async () => {
  // Fetch vehicles first
  if (vehicleStore.vehicles.length === 0) {
    try {
      await vehicleStore.fetchVehicles()
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error(t('vehicles.management.error'))
    }
  }
  
  // Get vehicle ID from route query
  if (route.query.vehicleId) {
    selectedVehicleId.value = String(route.query.vehicleId)
  } else {
    selectedVehicleId.value = null
  }
  // Don't set default vehicle - show all services if no vehicle is selected
  
  // Fetch services (will fetch all if no vehicleId is set)
  await fetchServices()
})

// Watch for route query changes
watch(() => route.query.vehicleId, (newVehicleId) => {
  if (newVehicleId) {
    selectedVehicleId.value = String(newVehicleId)
  } else {
    selectedVehicleId.value = null
  }
  fetchServices()
}, { immediate: false })
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
    <header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f1f1f4] dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 sm:px-10 py-3 transition-colors duration-200">
      <div class="flex items-center gap-4 text-[#121317] dark:text-white">
        <div class="size-8 flex items-center justify-center text-primary dark:text-blue-400">
          <span class="material-symbols-outlined text-3xl">local_taxi</span>
        </div>
        <h2 class="text-[#121317] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">{{ $t('vehicles.management.title') }}</h2>
      </div>
      <div class="flex flex-1 justify-end gap-4 sm:gap-8 items-center">
        <nav class="hidden md:flex items-center gap-9">
          <router-link to="/" class="text-[#121317] dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 text-sm font-medium leading-normal transition-colors">{{ $t('dashboard.title') }}</router-link>
          <router-link to="/vehicle-list" class="text-[#121317] dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 text-sm font-medium leading-normal transition-colors">{{ $t('vehicles.vehicleList') }}</router-link>
          <router-link to="/reports" class="text-[#121317] dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 text-sm font-medium leading-normal transition-colors">{{ $t('reports.title') }}</router-link>
        </nav>
        <div class="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex flex-col items-end">
            <span class="text-sm font-semibold dark:text-white">امیرحسین رضایی</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('subscription.tier.pro') }}</span>
          </div>
          <div class="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-gray-800 shadow-sm" data-alt="User profile avatar" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIlggVSiSEjowXShmlBOMiJpm3691nnKwqshmId0bNFRe8rFFsivfCXxRDq_VEbZxJ7i8qvc_Nmmlcp9sE5-WE6ZkX4_3mA1CyJBoV3DQuTJH-Vb-_fOgKQBc1Hf9MrMYnt0GQ1I_XS_6f_4emIHw0ATsHs2YaQXJH5KwanY48_6-Lit_0R_qjSeEpTNeMYSGD-q00G1L7mz-uBqeRYJubAzGNMVTVNrSdGHnXz-0Eq04m0su5ZHRH7Z-BpUo_LF74VbTzlkepb68");'></div>
        </div>
      </div>
    </header>
    <main class="flex-grow flex justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-[1200px] flex flex-col gap-6">
        <div class="flex flex-wrap justify-between items-end gap-4">
          <div class="flex flex-col gap-1">
            <h1 class="text-[#121317] dark:text-white tracking-tight text-[32px] font-bold leading-tight">{{ $t('services.serviceList') }}</h1>
            <p class="text-[#666e85] dark:text-gray-400 text-sm font-normal leading-normal">{{ $t('services.selectDetails.subtitle') }}</p>
          </div>
          <div class="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <span class="material-symbols-outlined text-gray-500 ms-2">directions_car</span>
            <select 
              :value="selectedVehicleId || ''"
              @change="handleVehicleChange($event.target.value || null)"
              class="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-gray-200 focus:ring-0 cursor-pointer pe-8 ps-2 py-1"
            >
              <option value="">{{ $t('services.allVehicles') }}</option>
              <option 
                v-for="vehicle in vehicleStore.vehicles" 
                :key="vehicle.id" 
                :value="vehicle.id"
              >
                {{ vehicle.model }} - {{ vehicle.year }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-if="isLoading || serviceStore.isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <!-- Services list -->
        <div v-else-if="filteredServices.length > 0" class="bg-white dark:bg-[#1A202C] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{{ $t('services.date') }}</th>
                  <th class="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{{ $t('services.serviceType') }}</th>
                  <th class="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{{ $t('services.mileage') }}</th>
                  <th class="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{{ $t('services.cost') }}</th>
                  <th class="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{{ $t('services.description') }}</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">{{ $t('common.actions', 'عملیات') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="service in filteredServices" :key="service.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ formatDate(service.date) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ $t(`services.types.${service.type}`, service.type) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ formatCurrency(service.km) }} {{ $t('vehicles.management.km') }}</td>
                  <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ formatCurrency(service.cost) }} {{ $t('common.currency') }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ service.note || '-' }}</td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="handleEdit(service)"
                        class="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        :title="$t('services.editService')"
                      >
                        <span class="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        @click="handleDelete(service)"
                        class="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        :title="$t('services.deleteService')"
                      >
                        <span class="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else class="bg-white dark:bg-[#1A202C] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <span class="material-symbols-outlined text-5xl text-gray-400 mb-4 block">build</span>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ $t('services.noServices') }}</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">{{ $t('vehicles.details.noServices') }}</p>
          <router-link to="/add-service" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all">
            <span class="material-symbols-outlined">add</span>
            {{ $t('services.addService') }}
          </router-link>
        </div>
        
        <!-- Back button -->
        <div class="flex justify-end">
          <button
            @click="handleBack"
            class="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {{ $t('services.selectDetails.back') }}
          </button>
        </div>
      </div>
    </main>
    
    <!-- Delete Confirmation Modal -->
    <Modal
      v-model:open="showDeleteModal"
      :title="$t('services.delete.confirmTitle')"
      size="md"
      :close-on-overlay="false"
    >
      <p class="text-gray-700 dark:text-gray-300 mb-6">
        {{ $t('services.delete.confirmMessage') }}
      </p>
      <template #footer>
        <button
          @click="handleDeleteCancel"
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          {{ $t('services.delete.cancelButton') }}
        </button>
        <button
          @click="handleDeleteConfirm"
          class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium"
          :disabled="serviceStore.isLoading"
        >
          {{ $t('services.delete.confirmButton') }}
        </button>
      </template>
    </Modal>
    
    <!-- Edit Service Modal -->
    <Modal
      v-model:open="showEditModal"
      :title="$t('services.edit.title')"
      size="lg"
      :close-on-overlay="false"
    >
      <form @submit.prevent="handleEditSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label class="flex flex-col gap-2">
            <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.serviceDate') }}</span>
            <input 
              v-model="editForm.date"
              class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow text-end" 
              :class="{ 'border-red-500': editFormErrors.date }"
              type="date" 
            />
            <p v-if="editFormErrors.date" class="text-red-500 text-xs mt-1">{{ editFormErrors.date }}</p>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.currentKm') }}</span>
            <div class="relative">
              <input 
                v-model="editForm.km"
                class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 pe-4 ps-12 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow dir-ltr text-right" 
                :class="{ 'border-red-500': editFormErrors.km }"
                :placeholder="$t('services.add.currentKmPlaceholder')" 
                type="number" 
              />
              <span class="absolute left-4 top-3 text-gray-400 text-sm">km</span>
              <p v-if="editFormErrors.km" class="text-red-500 text-xs mt-1">{{ editFormErrors.km }}</p>
            </div>
          </label>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label class="flex flex-col gap-2">
            <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.serviceType') }}</span>
            <select 
              v-model="editForm.type"
              class="form-select w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow bg-[position:left_0.5rem_center] ps-4 pe-10"
              :class="{ 'border-red-500': editFormErrors.type }"
            >
              <option value="">{{ $t('services.add.selectServiceType') }}</option>
              <option 
                v-for="serviceType in serviceTypes" 
                :key="serviceType.value" 
                :value="serviceType.value"
              >
                {{ serviceType.label }}
              </option>
            </select>
            <p v-if="editFormErrors.type" class="text-red-500 text-xs mt-1">{{ editFormErrors.type }}</p>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.totalCost') }}</span>
            <div class="relative">
              <span class="absolute left-4 top-3 text-gray-500 dark:text-gray-400 text-sm font-medium">{{ $t('common.currency') }}</span>
              <input 
                v-model="editForm.cost"
                class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 pe-4 ps-16 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow dir-ltr text-right" 
                :class="{ 'border-red-500': editFormErrors.cost }"
                placeholder="۰" 
                type="number" 
              />
              <p v-if="editFormErrors.cost" class="text-red-500 text-xs mt-1">{{ editFormErrors.cost }}</p>
            </div>
          </label>
        </div>
        
        <label class="flex flex-col gap-2">
          <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.note') }}</span>
          <textarea 
            v-model="editForm.note"
            class="form-textarea w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white min-h-[100px] p-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow resize-y" 
            :placeholder="$t('services.add.notePlaceholder')"
          ></textarea>
        </label>
        
        <div class="flex justify-end gap-4 pt-4">
          <button
            @click="handleEditCancel"
            type="button"
            class="px-6 py-3 rounded-xl border border-[#dcdfe4] dark:border-gray-600 text-[#121317] dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ $t('services.add.cancel') }}
          </button>
          <button
            type="submit"
            class="px-8 py-3 rounded-xl bg-primary hover:bg-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">save</span>
            {{ $t('services.edit.submit') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

