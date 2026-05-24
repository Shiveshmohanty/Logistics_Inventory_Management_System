
import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { AlertCircle, Plus, Pencil, Trash2, Box } from "lucide-react"
import { useWarehousesStore, Warehouse } from "@/store/useWarehousesStore"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

export default function WarehousesPage() {
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useWarehousesStore()
  const { toast } = useToast()
  
  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Warehouse>>({
    name: "",
    location: "",
    capacity: 0,
    usedSpace: 0,
    manager: "",
    contact: "",
    status: "Active"
  })
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const numericValue = type === "number" ? parseInt(value) || 0 : value
    
    // If changing capacity and it's less than current usedSpace, adjust usedSpace
    if (name === "capacity" && type === "number" && formData.usedSpace && parseInt(value) < formData.usedSpace) {
      setFormData({
        ...formData,
        [name]: numericValue,
        usedSpace: parseInt(value) || 0
      })
    } else {
      setFormData({
        ...formData,
        [name]: numericValue
      })
    }
    
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
    
    if (!formData.name?.trim()) {
      newErrors.name = "Warehouse name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Warehouse name must be at least 3 characters"
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = "Location is required"
    } else if (formData.location.length < 5) {
      newErrors.location = "Please enter a complete address"
    }
    
    if (formData.capacity === undefined || formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0"
    } else if (formData.capacity > 1000000) {
      newErrors.capacity = "Maximum capacity is 1,000,000 sqft"
    }
    
    if (formData.usedSpace === undefined || formData.usedSpace < 0) {
      newErrors.usedSpace = "Used space cannot be negative"
    }
    
    if (formData.capacity !== undefined && formData.usedSpace !== undefined && 
        formData.usedSpace > formData.capacity) {
      newErrors.usedSpace = "Used space cannot exceed capacity"
    }
    
    if (!formData.manager?.trim()) {
      newErrors.manager = "Manager name is required"
    }
    
    if (!formData.contact?.trim()) {
      newErrors.contact = "Contact information is required"
    } else if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.contact) && !/^\S+@\S+\.\S+$/.test(formData.contact)) {
      newErrors.contact = "Enter a valid phone (XXX-XXX-XXXX) or email"
    }
    
    if (!formData.status) {
      newErrors.status = "Status is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Add new warehouse
  const handleAddWarehouse = () => {
    if (!validateForm()) return
    
    addWarehouse(formData as Omit<Warehouse, 'id'>)
    
    toast({
      title: "Warehouse Added",
      description: `${formData.name} has been added to the system.`
    })
    
    // Reset form and close dialog
    setFormData({
      name: "",
      location: "",
      capacity: 0,
      usedSpace: 0,
      manager: "",
      contact: "",
      status: "Active"
    })
    setIsAddDialogOpen(false)
  }
  
  // Edit warehouse
  const handleEditClick = (warehouse: Warehouse) => {
    setSelectedWarehouseId(warehouse.id)
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
      usedSpace: warehouse.usedSpace,
      manager: warehouse.manager,
      contact: warehouse.contact,
      status: warehouse.status
    })
    setIsEditDialogOpen(true)
  }
  
  const handleUpdateWarehouse = () => {
    if (!validateForm() || !selectedWarehouseId) return
    
    updateWarehouse(selectedWarehouseId, formData)
    
    toast({
      title: "Warehouse Updated",
      description: `${formData.name} has been updated.`
    })
    
    // Reset form and close dialog
    setFormData({
      name: "",
      location: "",
      capacity: 0,
      usedSpace: 0,
      manager: "",
      contact: "",
      status: "Active"
    })
    setSelectedWarehouseId(null)
    setIsEditDialogOpen(false)
  }
  
  // Delete warehouse
  const handleDeleteClick = (warehouse: Warehouse) => {
    setSelectedWarehouseId(warehouse.id)
    setFormData({ name: warehouse.name })
    setIsDeleteDialogOpen(true)
  }
  
  const handleDeleteWarehouse = () => {
    if (!selectedWarehouseId) return
    
    deleteWarehouse(selectedWarehouseId)
    
    toast({
      title: "Warehouse Deleted",
      description: `${formData.name} has been removed from the system.`
    })
    
    // Reset and close dialog
    setFormData({
      name: "",
      location: "",
      capacity: 0,
      usedSpace: 0,
      manager: "",
      contact: "",
      status: "Active"
    })
    setSelectedWarehouseId(null)
    setIsDeleteDialogOpen(false)
  }
  
  // Get status badge color
  const getStatusColor = (status: Warehouse['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'Inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Calculate capacity usage percentage
  const getCapacityPercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100)
  }
  
  // Get capacity bar color based on usage percentage
  const getCapacityBarColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
              <p className="text-gray-500">Manage your warehouses and storage facilities</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Warehouse
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Warehouse</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new warehouse facility.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Warehouse Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        value={formData.location || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.location}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="capacity">Capacity (sqft)</Label>
                        <Input 
                          id="capacity" 
                          name="capacity" 
                          type="number" 
                          min="1"
                          max="1000000"
                          value={formData.capacity || 0} 
                          onChange={handleInputChange}
                        />
                        {errors.capacity && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.capacity}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="usedSpace">Used Space (sqft)</Label>
                        <Input 
                          id="usedSpace" 
                          name="usedSpace" 
                          type="number" 
                          min="0"
                          max={formData.capacity || 0}
                          value={formData.usedSpace || 0} 
                          onChange={handleInputChange}
                        />
                        {errors.usedSpace && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.usedSpace}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="manager">Manager</Label>
                      <Input 
                        id="manager" 
                        name="manager" 
                        value={formData.manager || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.manager && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.manager}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="contact">Contact</Label>
                      <Input 
                        id="contact" 
                        name="contact" 
                        placeholder="XXX-XXX-XXXX or email@example.com"
                        value={formData.contact || ""} 
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a valid phone number (XXX-XXX-XXXX) or email address
                      </p>
                      {errors.contact && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.contact}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status as string || "Active"} 
                        onValueChange={(value) => handleSelectChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.status}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddWarehouse}>Add Warehouse</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
          
          {/* Warehouses Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No warehouses found. Add your first warehouse to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  warehouses.map((warehouse) => {
                    const usagePercentage = getCapacityPercentage(warehouse.usedSpace, warehouse.capacity)
                    const progressColor = getCapacityBarColor(usagePercentage)
                    
                    return (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Box className="h-4 w-4 text-blue-600" />
                            {warehouse.name}
                          </div>
                        </TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{warehouse.usedSpace.toLocaleString()} / {warehouse.capacity.toLocaleString()} sqft</span>
                              <span className={`font-medium ${usagePercentage >= 80 ? 'text-red-600' : usagePercentage >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {usagePercentage}%
                              </span>
                            </div>
                            <Progress 
                              value={usagePercentage} 
                              className="h-2" 
                              indicatorClassName={progressColor}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{warehouse.manager}</TableCell>
                        <TableCell>{warehouse.contact}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(warehouse.status)}`}>
                            {warehouse.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(warehouse)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(warehouse)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Warehouse</DialogTitle>
                <DialogDescription>
                  Update the warehouse details.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Warehouse Name</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    value={formData.name || ""} 
                    onChange={handleInputChange}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.name}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input 
                    id="edit-location" 
                    name="location" 
                    value={formData.location || ""} 
                    onChange={handleInputChange}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.location}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-capacity">Capacity (sqft)</Label>
                    <Input 
                      id="edit-capacity" 
                      name="capacity" 
                      type="number" 
                      min="1"
                      max="1000000"
                      value={formData.capacity || 0} 
                      onChange={handleInputChange}
                    />
                    {errors.capacity && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.capacity}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-usedSpace">Used Space (sqft)</Label>
                    <Input 
                      id="edit-usedSpace" 
                      name="usedSpace" 
                      type="number" 
                      min="0"
                      max={formData.capacity || 0}
                      value={formData.usedSpace || 0} 
                      onChange={handleInputChange}
                    />
                    {errors.usedSpace && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.usedSpace}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-manager">Manager</Label>
                  <Input 
                    id="edit-manager" 
                    name="manager" 
                    value={formData.manager || ""} 
                    onChange={handleInputChange}
                  />
                  {errors.manager && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.manager}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-contact">Contact</Label>
                  <Input 
                    id="edit-contact" 
                    name="contact" 
                    placeholder="XXX-XXX-XXXX or email@example.com"
                    value={formData.contact || ""} 
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid phone number (XXX-XXX-XXXX) or email address
                  </p>
                  {errors.contact && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.contact}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={formData.status as string || "Active"} 
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.status}
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateWarehouse}>Update Warehouse</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete warehouse "{formData.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteWarehouse}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  )
}
  