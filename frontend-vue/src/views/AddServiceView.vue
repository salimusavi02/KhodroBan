<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServiceStore } from '../stores/service'
import { useVehicleStore } from '../stores/vehicle'

const router = useRouter()
const serviceStore = useServiceStore()
const vehicleStore = useVehicleStore()

// Form state
const formData = ref({
  vehicleId: '',
  date: new Date().toISOString().split('T')[0], // Today's date
  km: '',
  cost: '',
  type: '',
  types: [],
  note: '',
  shopName: ''
})

const formErrors = ref({})
const isSubmitting = ref(false)
const activeTab = ref('service') // 'service' or 'expense'

// Service type options
const serviceTypes = [
  { value: 'oil_change', label: 'تعویض روغن موتور' },
  { value: 'filter', label: 'تعویض فیلتر' },
  { value: 'brakes', label: 'لنت ترمز' },
  { value: 'battery', label: 'باتری و دینام' },
  { value: 'tire', label: 'تایر و بالانس' },
  { value: 'other', label: 'سایر' }
]

// Computed
const selectedVehicle = computed(() => {
  if (!formData.value.vehicleId) return null
  return vehicleStore.vehicles.find(v => v.id === formData.value.vehicleId)
})

const isFormValid = computed(() => {
  return formData.value.vehicleId && 
         formData.value.date && 
         formData.value.km && 
         formData.value.cost && 
         formData.value.type
})

// Methods
const validateForm = () => {
  const errors = {}
  
  if (!formData.value.vehicleId) {
    errors.vehicleId = 'انتخاب خودرو الزامی است'
  }
  
  if (!formData.value.date) {
    errors.date = 'تاریخ انجام الزامی است'
  }
  
  if (!formData.value.km || formData.value.km <= 0) {
    errors.km = 'کارکرد فعلی باید بیشتر از صفر باشد'
  }
  
  if (!formData.value.cost || formData.value.cost <= 0) {
    errors.cost = 'مبلغ باید بیشتر از صفر باشد'
  }
  
  if (!formData.value.type) {
    errors.type = 'انتخاب نوع سرویس الزامی است'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    // Convert date to Jalali format if needed
    const serviceData = {
      vehicleId: formData.value.vehicleId,
      date: formData.value.date, // Will be converted in service layer
      km: parseInt(formData.value.km),
      cost: parseInt(formData.value.cost),
      type: formData.value.type,
      types: [formData.value.type], // Single type for now
      note: formData.value.note || undefined
    }
    
    await serviceStore.createService(serviceData)
    
    // Navigate back to dashboard or services list
    router.push('/')
  } catch (error) {
    console.error('Error creating service:', error)
    // Error will be handled by the store and error handler
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const switchTab = (tab) => {
  activeTab.value = tab
}

// Lifecycle
onMounted(async () => {
  // Fetch vehicles if not already loaded
  if (vehicleStore.vehicles.length === 0) {
    try {
      await vehicleStore.fetchVehicles()
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }
  
  // Set first vehicle as default if available
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
            <h1 class="text-[#121317] dark:text-white tracking-tight text-[32px] font-bold leading-tight">ثبت فعالیت جدید</h1>
            <p class="text-[#666e85] dark:text-gray-400 text-sm font-normal leading-normal">ثبت سرویس یا هزینه جدید برای خودروی شما</p>
          </div>
          <div class="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <span class="material-symbols-outlined text-gray-500 ms-2">directions_car</span>
            <select 
              v-model="formData.vehicleId"
              class="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-gray-200 focus:ring-0 cursor-pointer pe-8 ps-2 py-1 bg-[position:left_0.5rem_center]"
              :class="{ 'border-red-500': formErrors.vehicleId }"
            >
              <option value="">انتخاب خودرو...</option>
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
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">تاریخ انجام</span>
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
              <label class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">کارکرد فعلی (کیلومتر)</span>
                <div class="relative">
                  <input 
                    v-model="formData.km"
                    class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 pe-4 ps-12 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow dir-ltr text-right" 
                    :class="{ 'border-red-500': formErrors.km }"
                    placeholder="مثال: ۵۴,۲۰۰" 
                    type="number" 
                  />
                  <span class="absolute left-4 top-3 text-gray-400 text-sm">km</span>
                  <p v-if="formErrors.km" class="text-red-500 text-xs mt-1">{{ formErrors.km }}</p>
                </div>
              </label>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label class="flex flex-col gap-2 md:col-span-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">نوع سرویس</span>
                <select 
                  v-model="formData.type"
                  class="form-select w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow bg-[position:left_0.5rem_center] ps-4 pe-10"
                  :class="{ 'border-red-500': formErrors.type }"
                >
                  <option value="">انتخاب نوع سرویس...</option>
                  <option 
                    v-for="serviceType in serviceTypes" 
                    :key="serviceType.value" 
                    :value="serviceType.value"
                  >
                    {{ serviceType.label }}
                  </option>
                </select>
                <p v-if="formErrors.type" class="text-red-500 text-xs mt-1">{{ formErrors.type }}</p>
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">مبلغ کل</span>
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
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">نام تعمیرگاه / سرویس‌کار <span class="text-gray-400 font-normal">(اختیاری)</span></span>
                <div class="relative">
                  <span class="material-symbols-outlined absolute start-4 top-3 text-gray-400 text-[20px]">storefront</span>
                  <input 
                    v-model="formData.shopName"
                    class="form-input w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white h-12 ps-11 pe-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                    placeholder="مثال: اتوسرویس مرکزی" 
                    type="text" 
                  />
                </div>
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[#121317] dark:text-gray-200 text-sm font-medium leading-normal">توضیحات تکمیلی</span>
                <textarea 
                  v-model="formData.note"
                  class="form-textarea w-full rounded-xl border border-[#dcdfe4] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#121317] dark:text-white min-h-[100px] p-4 focus:border-primary focus:ring-1 focus:ring-primary transition-shadow resize-y" 
                  placeholder="جزئیات بیشتر درباره سرویس انجام شده..."
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
                انصراف
              </button>
              <button 
                class="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                :disabled="!isFormValid || isSubmitting"
              >
                <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span v-else class="material-symbols-outlined text-[18px]">save</span>
                {{ isSubmitting ? 'در حال ثبت...' : 'ثبت و ذخیره' }}
              </button>
            </div>
          </form>
        </div>
        <div class="text-center py-4">
          <p class="text-sm text-gray-400 dark:text-gray-600">در انتخاب دسته‌بندی مشکل دارید؟ <router-link to="/select-service" class="text-primary dark:text-blue-400 hover:underline">مشاهده راهنما</router-link></p>
        </div>
      </div>
    </main>
  </div>
</template>
