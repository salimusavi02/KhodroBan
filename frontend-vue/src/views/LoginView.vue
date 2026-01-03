<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUIStore } from '../stores/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

const email = ref('')
const password = ref('')
const errors = ref({})

const isLoading = computed(() => authStore.isLoading)
const errorMessage = computed(() => authStore.error)

const validateForm = () => {
  errors.value = {}
  
  if (!email.value || !email.value.trim()) {
    errors.value.email = 'ایمیل الزامی است'
    return false
  }
  
  if (!email.value.includes('@')) {
    errors.value.email = 'ایمیل معتبر نیست'
    return false
  }
  
  if (!password.value || password.value.length < 6) {
    errors.value.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد'
    return false
  }
  
  return true
}

const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (!validateForm()) {
    return
  }
  
  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value
    })
    
    uiStore.showToast({
      message: 'خوش آمدید!',
      type: 'success'
    })
    
    // Redirect to intended page or dashboard
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    // Error is already set in store, but we can show a toast
    uiStore.showToast({
      message: error.message || 'خطا در ورود به سیستم',
      type: 'error'
    })
  }
}

const handleGoogleLogin = async () => {
  try {
    await authStore.loginWithGoogle()
  } catch (error) {
    uiStore.showToast({
      message: 'خطا در ورود با گوگل',
      type: 'error'
    })
  }
}
</script>

<template>
  <div class="bg-background-light dark:bg-background-dark font-display text-[#121317] dark:text-white h-screen overflow-hidden selection:bg-primary selection:text-white flex items-center justify-center relative">
    <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      <div class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-blue-400/10 rounded-full blur-[120px]"></div>
      <div class="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]"></div>
    </div>
    <main class="w-full max-w-md p-6 relative z-10">
      <div class="glass-panel p-8 rounded-3xl shadow-2xl flex flex-col gap-8 border-t border-white/80 dark:border-white/10">
        <div class="text-center flex flex-col items-center">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/30 flex items-center justify-center mb-6 text-white rotate-3 hover:rotate-6 transition-transform duration-300">
            <span class="material-symbols-outlined text-[40px] flip-rtl">local_taxi</span>
          </div>
          <h1 class="text-3xl font-black text-[#121317] dark:text-white tracking-tight mb-2">خودرو‌بان</h1>
          <p class="text-[#666e85] dark:text-gray-400 text-sm font-medium">به حساب کاربری خود وارد شوید</p>
        </div>
        
        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {{ errorMessage }}
        </div>
        
        <form @submit="handleSubmit" class="flex flex-col gap-5">
          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-[#121317] dark:text-gray-200 mr-1" for="email">ایمیل</label>
            <div class="relative group">
              <input 
                v-model="email"
                :class="[
                  'w-full px-5 py-3.5 pr-12 rounded-xl bg-white/60 dark:bg-black/20 border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 text-sm font-medium',
                  errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                ]"
                dir="ltr" 
                id="email" 
                name="email" 
                placeholder="example@mail.com" 
                type="email"
                :disabled="isLoading"
              />
              <span class="material-symbols-outlined absolute top-3.5 right-4 text-gray-400 group-focus-within:text-primary transition-colors">mail</span>
            </div>
            <p v-if="errors.email" class="text-red-500 text-xs mr-1">{{ errors.email }}</p>
          </div>
          
          <div class="space-y-1.5">
            <div class="flex justify-between items-center mr-1 ml-1">
              <label class="block text-sm font-bold text-[#121317] dark:text-gray-200" for="password">رمز عبور</label>
              <a class="text-xs font-bold text-primary hover:text-primary-light transition-colors" href="#">رمز عبور را فراموش کردید؟</a>
            </div>
            <div class="relative group">
              <input 
                v-model="password"
                :class="[
                  'w-full px-5 py-3.5 pr-12 rounded-xl bg-white/60 dark:bg-black/20 border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 text-sm font-medium',
                  errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                ]"
                dir="rtl" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                type="password"
                :disabled="isLoading"
              />
              <span class="material-symbols-outlined absolute top-3.5 right-4 text-gray-400 group-focus-within:text-primary transition-colors">lock</span>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mr-1">{{ errors.password }}</p>
          </div>
          
          <div class="pt-2">
            <button 
              :disabled="isLoading"
              :class="[
                'w-full py-3.5 rounded-xl text-white font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2',
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-light active:scale-[0.98] shadow-primary/25'
              ]"
              type="submit"
            >
              <span v-if="!isLoading">ورود به حساب</span>
              <span v-else>در حال ورود...</span>
              <span v-if="!isLoading" class="material-symbols-outlined text-[20px] rotate-180">arrow_right_alt</span>
            </button>
          </div>
        </form>
        
        <div class="relative flex items-center py-2">
          <div class="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span class="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">یا ورود با</span>
          <div class="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        
        <button 
          @click="handleGoogleLogin"
          :disabled="isLoading"
          class="w-full py-3 rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-[#121317] dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          <span class="group-hover:text-primary transition-colors">ورود با گوگل</span>
        </button>
        
        <div class="text-center">
          <p class="text-sm text-[#666e85] dark:text-gray-400 font-medium">
            حساب کاربری ندارید؟
            <router-link class="font-bold text-primary hover:text-primary-light mr-1 underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all" to="/signup">ثبت‌نام کنید</router-link>
          </p>
        </div>
      </div>
      <p class="text-center text-xs text-gray-400 mt-8 opacity-60">
        © ۱۴۰۲ خودرو‌بان. تمامی حقوق محفوظ است.
      </p>
    </main>
  </div>
</template>
