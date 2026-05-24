
// Simple English translations
export const translations = {
  // General
  appTitle: "Inventory Management System",
  dashboard: "Dashboard",
  inventory: "Inventory",
  shipments: "Shipments",
  orders: "Orders",
  users: "Users",
  warehouses: "Warehouses",
  settings: "Settings",
  
  // Settings page
  generalSettings: "General Settings",
  configureGeneralSettings: "Configure general system settings",
  companyName: "Company Name",
  companyNameDescription: "This name will appear throughout the application",
  lowStockThreshold: "Low Stock Threshold",
  lowStockThresholdDescription: "Products with quantity below this number will be marked as low stock",
  autoLogout: "Auto Logout (minutes)",
  autoLogoutDescription: "Users will be automatically logged out after this period of inactivity",
  
  notificationSettings: "Notification Settings",
  configureNotifications: "Configure how and when you receive notifications",
  emailNotifications: "Email Notifications",
  emailNotificationsDescription: "Receive email alerts for low stock and other important events",
  
  localizationSettings: "Localization Settings",
  configureLocalization: "Configure regional preferences",
  defaultCurrency: "Default Currency",
  defaultCurrencyDescription: "This currency will be used throughout the application",
  
  appearance: "Appearance",
  appearanceSettings: "Appearance Settings",
  configureAppearance: "Configure the visual appearance of the application",
  theme: "Theme",
  themeDescription: "Choose your preferred appearance mode",
  systemTheme: "System",
  lightTheme: "Light",
  darkTheme: "Dark",
  
  saveSettings: "Save Settings",
  settingsUpdated: "Settings updated",
  settingsUpdatedDescription: "Your settings have been successfully saved.",
  
  // Auth
  signIn: "Sign In",
  signOut: "Sign Out",
  email: "Email",
  password: "Password",
  
  // Other pages
  loading: "Loading...",
  error: "An error occurred",
  noData: "No data available",
};

// Simplified function to get translation (always returns English)
export const getTranslation = (key: string): string => {
  return translations[key] || key;
};
  