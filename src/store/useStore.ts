
import { create } from 'zustand'

// Define your store state type
interface StoreState {
  // This store is now replaced by more specific stores:
  // - useAuthStore for authentication
  // - useDashboardStore for dashboard data
}

// Create the store
export const useStore = create<StoreState>(() => ({
  // Initial state is empty as we're using specialized stores
}))
  