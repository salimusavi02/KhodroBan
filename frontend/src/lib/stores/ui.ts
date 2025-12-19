import { writable } from 'svelte/store';

// Toast store
interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

function createToastStore() {
  const { subscribe, set, update } = writable<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    subscribe,

    show(message: string, type: ToastState['type'] = 'info', duration = 4000) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      set({ visible: true, message, type });

      timeoutId = setTimeout(() => {
        update(state => ({ ...state, visible: false }));
      }, duration);
    },

    success(message: string, duration?: number) {
      this.show(message, 'success', duration);
    },

    error(message: string, duration?: number) {
      this.show(message, 'error', duration);
    },

    warning(message: string, duration?: number) {
      this.show(message, 'warning', duration);
    },

    info(message: string, duration?: number) {
      this.show(message, 'info', duration);
    },

    hide() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      update(state => ({ ...state, visible: false }));
    },
  };
}

export const toastStore = createToastStore();

// Modal store
interface ModalState {
  isOpen: boolean;
  component: any;
  props: Record<string, any>;
}

function createModalStore() {
  const { subscribe, set, update } = writable<ModalState>({
    isOpen: false,
    component: null,
    props: {},
  });

  return {
    subscribe,

    open(component: any, props: Record<string, any> = {}) {
      set({ isOpen: true, component, props });
    },

    close() {
      set({ isOpen: false, component: null, props: {} });
    },

    updateProps(props: Record<string, any>) {
      update(state => ({ ...state, props: { ...state.props, ...props } }));
    },
  };
}

export const modalStore = createModalStore();

// Loading store (global loading state)
function createLoadingStore() {
  const { subscribe, set, update } = writable<boolean>(false);

  return {
    subscribe,
    show: () => set(true),
    hide: () => set(false),
    toggle: () => update(state => !state),
  };
}

export const loadingStore = createLoadingStore();

// Sidebar store (for desktop navigation)
function createSidebarStore() {
  const { subscribe, set, update } = writable<boolean>(false);

  return {
    subscribe,
    open: () => set(true),
    close: () => set(false),
    toggle: () => update(state => !state),
  };
}

export const sidebarStore = createSidebarStore();
