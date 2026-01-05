<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useServiceStore } from '../stores/service'
import { useVehicleStore } from '../stores/vehicle'
import { useServiceTypeStore } from '../stores/serviceType'
import { useExpenseCategoryStore } from '../stores/expenseCategory'
import { useExpenseStore } from '../stores/expense'
import { useToast } from '../composables/useToast'
import Modal from '../components/ui/Modal.vue'
import ServiceTypeSelector from '../components/ServiceTypeSelector.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const serviceStore = useServiceStore()
const vehicleStore = useVehicleStore()
const serviceTypeStore = useServiceTypeStore()
const expenseCategoryStore = useExpenseCategoryStore()
const expenseStore = useExpenseStore()
const toast = useToast()

// Form state
const formData = ref({
  vehicleId: '',
  date: new Date().toISOString().split('T')[0], // Today's date
  km: '',
  cost: '',
  type: '',
  types: [], // For services
  category: '', // For expenses
  note: '',
  shopName: ''
})

const formErrors = ref({})
const isSubmitting = ref(false)
const activeTab = ref('service') // 'service' or 'expense'
const showServiceTypeModal = ref(false)

// Autocomplete state
const autocompleteQuery = ref('')
const showAutocompleteDropdown = ref(false)
const autocompleteFocusedIndex = ref(-1)

// All available service types from store (database + i18n)
const allServiceTypes = computed(() => {
  return serviceTypeStore.serviceTypeOptions
})

// All available expense categories from store (database + i18n)
const allExpenseCategories = computed(() => {
  return expenseCategoryStore.expenseCategoryOptions
})

// Current options based on active tab
const currentOptions = computed(() => {
  return activeTab.value === 'service' ? allServiceTypes.value : allExpenseCategories.value
})

// Filtered options for autocomplete
const filteredOptions = computed(() => {
  const selectedValues = activeTab.value === 'service' 
    ? formData.value.types 
    : (formData.value.category ? [formData.value.category] : [])
  
  if (!autocompleteQuery.value.trim()) {
    return currentOptions.value.filter(opt => !selectedValues.includes(opt.value))
  }
  
  const query = autocompleteQuery.value.toLowerCase().trim()
  return currentOptions.value.filter(opt => 
    !selectedValues.includes(opt.value) &&
    (opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query))
  )
})

// Get label by value based on active tab
const getLabel = (value) => {
  if (activeTab.value === 'service') {
    return serviceTypeStore.getServiceTypeLabel(value)
  } else {
    return expenseCategoryStore.getExpenseCategoryLabel(value)
  }
}

// Computed
const selectedVehicle = computed(() => {
  if (!formData.value.vehicleId) return null
  return vehicleStore.vehicles.find(v => v.id === formData.value.vehicleId)
})

const isFormValid = computed(() => {
  const hasBasicFields = formData.value.vehicleId && 
         formData.value.date && 
         formData.value.cost
  
  if (activeTab.value === 'service') {
    return hasBasicFields && 
           formData.value.km && 
           formData.value.types.length > 0
  } else {
    return hasBasicFields && 
           formData.value.category
  }
})

// Methods
const validateForm = () => {
  const errors = {}
  
  if (!formData.value.vehicleId) {
    errors.vehicleId = t('services.add.validation.vehicleRequired')
  }
  
  if (!formData.value.date) {
    errors.date = t('services.add.validation.dateRequired')
  }
  
  if (!formData.value.cost || formData.value.cost <= 0) {
    errors.cost = t('services.add.validation.costRequired')
  } else if (isNaN(parseInt(formData.value.cost))) {
    errors.cost = t('services.add.validation.costInvalid')
  }
  
  if (activeTab.value === 'service') {
    if (formData.value.types.length === 0) {
      errors.type = t('services.add.validation.typeRequired')
    }
    if (!formData.value.km || formData.value.km <= 0) {
      errors.km = t('services.add.validation.kmRequired')
    } else if (isNaN(parseInt(formData.value.km))) {
      errors.km = t('services.add.validation.kmInvalid')
    }
  } else {
    if (!formData.value.category) {
      errors.category = t('expenses.add.validation.categoryRequired', 'انتخاب دسته‌بندی الزامی است')
    }
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.warning(t('validation.required'))
    return
  }
  
  isSubmitting.value = true
  
  try {
    if (activeTab.value === 'service') {
      // Create service
      const serviceData = {
        vehicleId: formData.value.vehicleId,
        date: formData.value.date, // Will be converted in service layer
        km: parseInt(formData.value.km),
        cost: parseInt(formData.value.cost),
        type: formData.value.types[0] || formData.value.type, // Primary type
        types: formData.value.types.length > 0 ? formData.value.types : [],
        note: formData.value.note || undefined
      }
      
      await serviceStore.createService(serviceData)
      toast.success(t('services.add.success'))
    } else {
      // Create expense
      const expenseData = {
        vehicleId: formData.value.vehicleId,
        date: formData.value.date, // Will be converted in service layer
        amount: parseInt(formData.value.cost),
        category: formData.value.category,
        description: formData.value.note || undefined
      }
      
      await expenseStore.createExpense(expenseData)
      toast.success(t('expenses.add.success', 'هزینه با موفقیت ثبت شد'))
    }
    
    // Navigate back to dashboard
    router.push('/')
  } catch (error) {
    console.error('Error creating record:', error)
    const errorMessage = activeTab.value === 'service' 
      ? (error?.message || t('services.add.error'))
      : (error?.message || t('expenses.add.error', 'خطا در ثبت هزینه'))
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const switchTab = (tab) => {
  activeTab.value = tab
  // Reset form data when switching tabs
  if (tab === 'service') {
    formData.value.category = ''
  } else {
    formData.value.types = []
    formData.value.type = ''
    formData.value.km = ''
  }
  autocompleteQuery.value = ''
  showAutocompleteDropdown.value = false
}

const openServiceTypeModal = () => {
  showServiceTypeModal.value = true
}

const handleServiceTypeSelect = (data) => {
  formData.value.types = data.types
  formData.value.type = data.types[0] // Set first type as primary
  if (data.vehicleId) {
    formData.value.vehicleId = data.vehicleId
  }
  showServiceTypeModal.value = false
  toast.success(t('services.selectType.selected') + ' ' + data.types.length + ' ' + t('services.selectType.selectedCount'))
}

const handleServiceTypeCancel = () => {
  showServiceTypeModal.value = false
}

// Autocomplete methods
const handleAutocompleteInput = (event) => {
  autocompleteQuery.value = event.target.value
  showAutocompleteDropdown.value = true
  autocompleteFocusedIndex.value = -1
}

const handleAutocompleteFocus = () => {
  if (filteredOptions.value.length > 0) {
    showAutocompleteDropdown.value = true
  }
}

const handleAutocompleteBlur = () => {
  // Delay to allow click on dropdown items
  setTimeout(() => {
    showAutocompleteDropdown.value = false
    autocompleteQuery.value = ''
  }, 200)
}

const selectOption = (option) => {
  if (activeTab.value === 'service') {
    if (!formData.value.types.includes(option.value)) {
      formData.value.types.push(option.value)
      formData.value.type = option.value // Set as primary type
    }
  } else {
    formData.value.category = option.value
  }
  autocompleteQuery.value = ''
  showAutocompleteDropdown.value = false
}

const removeServiceType = (value) => {
  const index = formData.value.types.indexOf(value)
  if (index > -1) {
    formData.value.types.splice(index, 1)
    // Update primary type if removed
    if (formData.value.type === value) {
      formData.value.type = formData.value.types[0] || ''
    }
  }
}

const removeExpenseCategory = () => {
  formData.value.category = ''
}

const handleAutocompleteKeydown = (event) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (autocompleteFocusedIndex.value < filteredOptions.value.length - 1) {
      autocompleteFocusedIndex.value++
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (autocompleteFocusedIndex.value > 0) {
      autocompleteFocusedIndex.value--
    }
  } else if (event.key === 'Enter' && autocompleteFocusedIndex.value >= 0) {
    event.preventDefault()
    const selected = filteredOptions.value[autocompleteFocusedIndex.value]
    if (selected) {
      selectOption(selected)
    }
  } else if (event.key === 'Escape') {
    showAutocompleteDropdown.value = false
    autocompleteQuery.value = ''
  }
}

// Lifecycle
onMounted(async () => {
  // Fetch service types from database if not already loaded
  if (serviceTypeStore.serviceTypes.length === 0) {
    try {
      await serviceTypeStore.fetchServiceTypes()
    } catch (error) {
      console.error('Error fetching service types:', error)
      toast.error(t('services.error', 'خطا در دریافت انواع سرویس'))
    }
  }
  
  // Fetch expense categories from database if not already loaded
  if (expenseCategoryStore.expenseCategories.length === 0) {
    try {
      await expenseCategoryStore.fetchExpenseCategories()
    } catch (error) {
      console.error('Error fetching expense categories:', error)
      toast.error(t('expenses.error', 'خطا در دریافت دسته‌بندی هزینه‌ها'))
    }
  }
  
  // Check for query parameters (from SelectServiceTypeView)
  if (route.query.types) {
    const types = route.query.types.split(',')
    formData.value.types = types
    formData.value.type = types[0] || '' // Set first type as primary
  }
  
  if (route.query.vehicleId) {
    formData.value.vehicleId = route.query.vehicleId
  }
  
  // Fetch vehicles if not already loaded
  if (vehicleStore.vehicles.length === 0) {
    try {
      await vehicleStore.fetchVehicles()
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error(t('vehicles.management.error'))
    }
  }
  
  // Set first vehicle as default if available and not set from query
  if (vehicleStore.vehicles.length > 0 && !formData.value.vehicleId) {
    formData.value.vehicleId = vehicleStore.vehicles[0].id
  }
})
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
    <header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f1f1f4] dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 sm:px-10 py-3 transition-colors duration-200">
      <div class="flex items-center gap-4 text-[#121317] dark:text-white">
        <div class="size-8 flex items-center justify-center text-primary dark:text-blue-400">
          <span class="material-symbols-outlined text-3xl">local_taxi</span>
        </div>
        <h2 class="text-[#121317] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">مدیریت خودرو</h2>
      </div>
      <div class="flex flex-1 justify-end gap-4 sm:gap-8 items-center">
        <nav class="hidden md:flex items-center gap-9">
          <router-link to="/" class="text-[#121317] dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 text-sm font-medium leading-normal transition-colors">داشبورد</router-link>
          <router-link to="/vehicle-list" class="text-[#121317] dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 text-sm font-medium leading-normal transition-colors">خودروها</router-link>
          <router-link to="/reports" class="text-[#121317] dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 text-sm font-medium leading-normal transition-colors">گزارش‌ها</router-link>
        </nav>
        <div class="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex flex-col items-end">
            <span class="text-sm font-semibold dark:text-white">امیرحسین رضایی</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">طرح حرفه‌ای</span>
          </div>
          <div class="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-gray-800 shadow-sm" data-alt="User profile avatar" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIlggVSiSEjowXShmlBOMiJpm3691nnKwqshmId0bNFRe8rFFsivfCXxRDq_VEbZxJ7i8qvc_Nmmlcp9sE5-WE6ZkX4_3mA1CyJBoV3DQuTJH-Vb-_fOgKQBc1Hf9MrMYnt0GQ1I_XS_6f_4emIHw0ATsHs2YaQXJH5KwanY48_6-Lit_0R_qjSeEpTNeMYSGD-q00G1L7mz-uBqeRYJubAzGNMVTVNrSdGHnXz-0Eq04m0su5ZHRH7Z-BpUo_LF74VbTzlkepb68");'></div>
        </div>
      </div>
    </header>
    <main class="flex-grow flex justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-[960px] flex flex-col gap-6">
        <div class="flex flex-wrap justify-between items-end gap-4">
          <div class="flex flex-col gap-1">
            <h1 class="text-[#121317] dark:text-white tracking-tight text-[32px] font-bold leading-tight">{{ $t('services.add.title') }}</h1>
            <p class="text-[#666e85] dark:text-gray-400 text-sm font-normal leading-normal">{{ $t('services.add.subtitle') }}</p>
          </div>
          <div class="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <span class="material-symbols-outlined text-gray-500 ms-2">directions_car</span>
            <select 
              v-model="formData.vehicleId"
              class="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-gray-200 focus:ring-0 cursor-pointer pe-8 ps-2 py-1 bg-[position:left_0.5rem_center]"
              :class="{ 'border-red-500': formErrors.vehicleId }"
            >
              <option value="">{{ $t('services.add.selectVehicle') }}</option>
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
        <div v-if="vehicleStore.isLoading || serviceStore.isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <!-- Form -->
        <div v-else class="bg-white dark:bg-[#1A202C] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="flex border-b border-[#dcdfe4] dark:border-gray-700">
            <button 
              @click="switchTab('service')"
              :class="[
                'flex-1 flex flex-col items-center justify-center py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                activeTab === 'service' 
                  ? 'border-b-[3px] border-b-primary text-primary dark:text-blue-400' 
                  : 'border-b-[3px] border-b-transparent text-[#666e85] dark:text-gray-400'
              ]"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px]">build</span>
                <p class="text-sm font-bold leading-normal tracking-[0.015em]">سرویس دوره‌ای</p>
              </div>
            </button>
            <button 
              @click="switchTab('expense')"
              :class="[
                'flex-1 flex flex-col items-center justify-center py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                activeTab === 'expense' 
                  ? 'border-b-[3px] border-b-primary text-primary dark:text-blue-400' 
                  : 'border-b-[3px] border-b-transparent text-[#666e85] dark:text-gray-400'
              ]"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                <p class="text-sm font-bold leading-normal tracking-[0.015em]">هزینه جانبی</p>
              </div>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="p-6 sm:p-8 space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.serviceDate') }}</span>
                <div class="relative">
                  <input 
                    v-model="formData.date"
                    class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow text-end" 
                    :class="{ 'border-red-500': formErrors.date }"
                    type="date" 
                  />
                  <p v-if="formErrors.date" class="text-red-500 text-xs mt-1">{{ formErrors.date }}</p>
                </div>
              </label>
              <label v-if="activeTab === 'service'" class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.currentKm') }}</span>
                <div class="relative">
                  <input 
                    v-model="formData.km"
                    class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 pe-4 ps-12 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow dir-ltr text-right" 
                    :class="{ 'border-red-500': formErrors.km }"
                    :placeholder="$t('services.add.currentKmPlaceholder')" 
                    type="number" 
                  />
                  <span class="absolute left-4 top-3 text-gray-400 text-sm">km</span>
                  <p v-if="formErrors.km" class="text-red-500 text-xs mt-1">{{ formErrors.km }}</p>
                </div>
              </label>
            </div>
            
            <!-- Service Type (for service tab) -->
            <div v-if="activeTab === 'service'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label class="flex flex-col gap-2 md:col-span-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.serviceType') }}</span>
                <div class="relative">
                  <div class="flex flex-wrap items-center gap-2 min-h-[48px] p-2 pe-12 rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-shadow"
                    :class="{ 'border-red-500': formErrors.type }"
                  >
                    <!-- Selected service type tags -->
                    <span 
                      v-for="(type, index) in formData.types" 
                      :key="index"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary dark:text-blue-400 text-sm font-medium"
                    >
                      {{ getLabel(type) }}
                      <button
                        @click.stop="removeServiceType(type)"
                        type="button"
                        class="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        :aria-label="$t('common.close')"
                      >
                        <span class="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                    <!-- Autocomplete input -->
                    <input
                      v-model="autocompleteQuery"
                      @input="handleAutocompleteInput"
                      @focus="handleAutocompleteFocus"
                      @blur="handleAutocompleteBlur"
                      @keydown="handleAutocompleteKeydown"
                      class="flex-1 min-w-[120px] h-8 border-none bg-transparent text-[#121317] dark:text-white focus:outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      :placeholder="formData.types.length === 0 ? $t('services.add.selectServiceType') : ''"
                      type="text"
                    />
                    <!-- Alternative: Open modal button -->
                    <button
                      @click.stop="openServiceTypeModal"
                      type="button"
                      class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      :title="$t('services.add.selectFromModal')"
                    >
                      <span class="material-symbols-outlined text-lg">tune</span>
                    </button>
                  </div>
                  <!-- Autocomplete dropdown -->
                  <Transition name="fade">
                    <div 
                      v-if="showAutocompleteDropdown && filteredOptions.length > 0"
                      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      @mousedown.prevent
                    >
                      <button
                        v-for="(option, index) in filteredOptions"
                        :key="option.value"
                        @click="selectOption(option)"
                        @mouseenter="autocompleteFocusedIndex = index"
                        type="button"
                        class="w-full px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2"
                        :class="{ 'bg-gray-50 dark:bg-gray-700': autocompleteFocusedIndex === index }"
                      >
                        <span class="text-sm font-medium text-[#121317] dark:text-white">{{ option.label }}</span>
                        <span class="material-symbols-outlined text-gray-400 text-lg">add</span>
                      </button>
                    </div>
                  </Transition>
                </div>
                <p v-if="formErrors.type" class="text-red-500 text-xs mt-1">{{ formErrors.type }}</p>
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.totalCost') }}</span>
                <div class="relative">
                  <span class="absolute left-4 top-3 text-gray-500 dark:text-gray-400 text-sm font-medium">تومان</span>
                  <input 
                    v-model="formData.cost"
                    class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 pe-4 ps-16 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow dir-ltr text-right" 
                    :class="{ 'border-red-500': formErrors.cost }"
                    placeholder="۰" 
                    type="number" 
                  />
                  <p v-if="formErrors.cost" class="text-red-500 text-xs mt-1">{{ formErrors.cost }}</p>
                </div>
              </label>
            </div>
            
            <!-- Expense Category (for expense tab) -->
            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label class="flex flex-col gap-2 md:col-span-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('expenses.category') }}</span>
                <div class="relative">
                  <div class="flex flex-wrap items-center gap-2 min-h-[48px] p-2 pe-12 rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-shadow"
                    :class="{ 'border-red-500': formErrors.category }"
                  >
                    <!-- Selected expense category tag -->
                    <span 
                      v-if="formData.category"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary dark:text-blue-400 text-sm font-medium"
                    >
                      {{ getLabel(formData.category) }}
                      <button
                        @click.stop="removeExpenseCategory"
                        type="button"
                        class="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        :aria-label="$t('common.close')"
                      >
                        <span class="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                    <!-- Autocomplete input -->
                    <input
                      v-model="autocompleteQuery"
                      @input="handleAutocompleteInput"
                      @focus="handleAutocompleteFocus"
                      @blur="handleAutocompleteBlur"
                      @keydown="handleAutocompleteKeydown"
                      class="flex-1 min-w-[120px] h-8 border-none bg-transparent text-[#121317] dark:text-white focus:outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      :placeholder="!formData.category ? $t('expenses.selectCategory', 'انتخاب دسته‌بندی...') : ''"
                      type="text"
                    />
                  </div>
                  <!-- Autocomplete dropdown -->
                  <Transition name="fade">
                    <div 
                      v-if="showAutocompleteDropdown && filteredOptions.length > 0"
                      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      @mousedown.prevent
                    >
                      <button
                        v-for="(option, index) in filteredOptions"
                        :key="option.value"
                        @click="selectOption(option)"
                        @mouseenter="autocompleteFocusedIndex = index"
                        type="button"
                        class="w-full px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2"
                        :class="{ 'bg-gray-50 dark:bg-gray-700': autocompleteFocusedIndex === index }"
                      >
                        <span class="text-sm font-medium text-[#121317] dark:text-white">{{ option.label }}</span>
                        <span class="material-symbols-outlined text-gray-400 text-lg">add</span>
                      </button>
                    </div>
                  </Transition>
                </div>
                <p v-if="formErrors.category" class="text-red-500 text-xs mt-1">{{ formErrors.category }}</p>
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('expenses.amount') }}</span>
                <div class="relative">
                  <span class="absolute left-4 top-3 text-gray-500 dark:text-gray-400 text-sm font-medium">تومان</span>
                  <input 
                    v-model="formData.cost"
                    class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 pe-4 ps-16 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow dir-ltr text-right" 
                    :class="{ 'border-red-500': formErrors.cost }"
                    placeholder="۰" 
                    type="number" 
                  />
                  <p v-if="formErrors.cost" class="text-red-500 text-xs mt-1">{{ formErrors.cost }}</p>
                </div>
              </label>
            </div>
            
            <div class="space-y-6">
              <label class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.shopName') }} <span class="text-gray-400 font-normal">({{ $t('common.optional') }})</span></span>
                <div class="relative">
                  <span class="material-symbols-outlined absolute start-4 top-3 text-gray-400 text-[20px]">storefront</span>
                  <input 
                    v-model="formData.shopName"
                    class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 ps-11 pe-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                    :placeholder="$t('services.add.shopNamePlaceholder')" 
                    type="text" 
                  />
                </div>
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">{{ $t('services.add.note') }}</span>
                <textarea 
                  v-model="formData.note"
                  class="form-textarea w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white min-h-[100px] p-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow resize-y" 
                  :placeholder="$t('services.add.notePlaceholder')"
                ></textarea>
              </label>
            </div>
            
            <!-- Error display -->
            <div v-if="serviceStore.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p class="text-red-700 dark:text-red-400 text-sm">{{ serviceStore.error }}</p>
            </div>
            
            <div class="pt-4 flex flex-col sm:flex-row justify-end gap-4">
              <button 
                @click="handleCancel"
                class="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#dcdfe4] dark:border-gray-600 text-[#121317] dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                type="button"
                :disabled="isSubmitting"
              >
                {{ $t('services.add.cancel') }}
              </button>
              <button 
                class="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                :disabled="!isFormValid || isSubmitting"
              >
                <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span v-else class="material-symbols-outlined text-[18px]">save</span>
                {{ isSubmitting ? $t('services.add.submitting') : $t('services.add.submit') }}
              </button>
            </div>
          </form>
        </div>
        <div class="text-center py-4">
          <p class="text-sm text-gray-400 dark:text-gray-600">{{ $t('services.add.helpText') }} <button @click="openServiceTypeModal" class="text-primary dark:text-blue-400 hover:underline">{{ $t('services.add.helpLink') }}</button></p>
        </div>
      </div>
    </main>
    
    <!-- Service Type Selection Modal -->
    <Modal
      :open="showServiceTypeModal"
      @update:open="showServiceTypeModal = $event"
      @close="handleServiceTypeCancel"
      size="lg"
      :title="$t('services.selectType.title')"
    >
      <ServiceTypeSelector
        :vehicle-id="formData.vehicleId"
        @select="handleServiceTypeSelect"
        @cancel="handleServiceTypeCancel"
      />
    </Modal>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
