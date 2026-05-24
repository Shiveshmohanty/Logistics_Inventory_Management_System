
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useSettingsStore } from './store/useSettingsStore.ts'

// Get the dark mode setting from the settings store
const { settings } = useSettingsStore.getState();

// Apply dark mode class to the document if dark mode is enabled
if (settings.darkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
  