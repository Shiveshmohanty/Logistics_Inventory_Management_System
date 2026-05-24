
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SystemSettings {
  companyName: string
  lowStockThreshold: number
  defaultCurrency: string
  emailNotifications: boolean
  darkMode: boolean
  language: string
  autoLogout: number // in minutes
}

interface SettingsState {
  settings: SystemSettings
  updateSettings: (newSettings: Partial<SystemSettings>) => void
  resetSettings: () => void
}

// Function to toggle dark mode in the document
const toggleDarkMode = (enabled: boolean) => {
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const defaultSettings: SystemSettings = {
  companyName: 'Hexawinds Inventory',
  lowStockThreshold: 10,
  defaultCurrency: 'USD',
  emailNotifications: true,
  darkMode: false,
  language: 'en',
  autoLogout: 30
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (newSettings) => {
        set((state) => {
          // If dark mode is being toggled, update the document class
          if (newSettings.darkMode !== undefined && newSettings.darkMode !== state.settings.darkMode) {
            toggleDarkMode(newSettings.darkMode);
          }
          
          return {
            settings: {
              ...state.settings,
              ...newSettings
            }
          };
        });
      },
      
      resetSettings: () => {
        // Update dark mode in the document when resetting settings
        toggleDarkMode(defaultSettings.darkMode);
        set({ settings: defaultSettings });
      }
    }),
    {
      name: 'hexawinds-settings'
    }
  )
)
  