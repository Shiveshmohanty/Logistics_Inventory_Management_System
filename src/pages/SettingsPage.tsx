
import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Save } from "lucide-react"
import { useSettingsStore, SystemSettings } from "@/store/useSettingsStore"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettingsStore()
  const { toast } = useToast()
  
  // Form state
  const [formData, setFormData] = useState<SystemSettings>({...settings})
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    })
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    })
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company name is required"
    }
    
    if (formData.lowStockThreshold < 1) {
      newErrors.lowStockThreshold = "Low stock threshold must be at least 1"
    }
    
    if (!formData.defaultCurrency?.trim()) {
      newErrors.defaultCurrency = "Default currency is required"
    }
    
    if (formData.autoLogout < 1) {
      newErrors.autoLogout = "Auto logout time must be at least 1 minute"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSaveSettings = () => {
    if (!validateForm()) return
    
    updateSettings(formData)
    
    toast({
      title: "Settings Saved",
      description: "Your system settings have been updated successfully."
    })
  }
  
  const handleResetSettings = () => {
    resetSettings()
    setFormData({...settings})
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values."
    })
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-500">Configure your Hexawinds system preferences</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleResetSettings}>
                Reset to Default
              </Button>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
          
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Basic system configuration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      name="companyName" 
                      value={formData.companyName} 
                      onChange={handleInputChange}
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.companyName}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input 
                      id="lowStockThreshold" 
                      name="lowStockThreshold" 
                      type="number" 
                      min="1"
                      value={formData.lowStockThreshold} 
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Items with quantity below this value will be marked as low stock
                    </p>
                    {errors.lowStockThreshold && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.lowStockThreshold}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select 
                      value={formData.defaultCurrency} 
                      onValueChange={(value) => handleSelectChange("defaultCurrency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.defaultCurrency && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.defaultCurrency}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
                    <Input 
                      id="autoLogout" 
                      name="autoLogout" 
                      type="number"
                      min="1" 
                      value={formData.autoLogout} 
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Automatically log out inactive users after this many minutes
                    </p>
                    {errors.autoLogout && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.autoLogout}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how you receive system notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch
                      id="emailNotifications"
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about low stock, new orders, and shipment updates via email
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how Hexawinds looks for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <Switch
                      id="darkMode"
                      checked={formData.darkMode}
                      onCheckedChange={(checked) => handleSwitchChange("darkMode", checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme for reduced eye strain in low-light environments
                  </p>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => handleSelectChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  )
}
  