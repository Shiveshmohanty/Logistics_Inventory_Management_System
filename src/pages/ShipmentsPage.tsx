
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
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Plus, Pencil, Trash2 } from "lucide-react"
import { useShipmentsStore, Shipment, ShipmentStatus } from "@/store/useShipmentsStore"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/useAuthStore"

export default function ShipmentsPage() {
  const { shipments, addShipment, updateShipment, deleteShipment } = useShipmentsStore()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  
  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Shipment>>({
    trackingNumber: "",
    origin: "",
    destination: "",
    status: "Pending",
    estimatedDelivery: "",
    items: []
  })
  const [itemsText, setItemsText] = useState("")
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === "items") {
      setItemsText(value)
    } else {
      setFormData({
        ...formData,
        [name]: value
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
    
    if (!formData.trackingNumber?.trim()) {
      newErrors.trackingNumber = "Tracking number is required"
    }
    
    if (!formData.origin?.trim()) {
      newErrors.origin = "Origin is required"
    }
    
    if (!formData.destination?.trim()) {
      newErrors.destination = "Destination is required"
    }
    
    if (!formData.status) {
      newErrors.status = "Status is required"
    }
    
    if (!formData.estimatedDelivery?.trim()) {
      newErrors.estimatedDelivery = "Estimated delivery date is required"
    }
    
    if (!itemsText.trim()) {
      newErrors.items = "At least one item is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const prepareFormData = () => {
    // Parse items from comma-separated text
    const items = itemsText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
    
    return {
      ...formData,
      items
    }
  }
  
  // Add new shipment
  const handleAddShipment = () => {
    if (!validateForm()) return
    
    const newShipment = prepareFormData() as Omit<Shipment, 'id' | 'lastUpdated'>
    addShipment(newShipment)
    
    toast({
      title: "Shipment Added",
      description: `Shipment ${formData.trackingNumber} has been created.`
    })
    
    // Reset form and close dialog
    setFormData({
      trackingNumber: "",
      origin: "",
      destination: "",
      status: "Pending",
      estimatedDelivery: "",
      items: []
    })
    setItemsText("")
    setIsAddDialogOpen(false)
  }
  
  // Edit shipment
  const handleEditClick = (shipment: Shipment) => {
    setSelectedShipmentId(shipment.id)
    setFormData({
      trackingNumber: shipment.trackingNumber,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery
    })
    setItemsText(shipment.items.join(', '))
    setIsEditDialogOpen(true)
  }
  
  const handleUpdateShipment = () => {
    if (!validateForm() || !selectedShipmentId) return
    
    const updatedShipment = prepareFormData()
    updateShipment(selectedShipmentId, updatedShipment)
    
    toast({
      title: "Shipment Updated",
      description: `Shipment ${formData.trackingNumber} has been updated.`
    })
    
    // Reset form and close dialog
    setFormData({
      trackingNumber: "",
      origin: "",
      destination: "",
      status: "Pending",
      estimatedDelivery: "",
      items: []
    })
    setItemsText("")
    setSelectedShipmentId(null)
    setIsEditDialogOpen(false)
  }
  
  // Delete shipment
  const handleDeleteClick = (shipment: Shipment) => {
    setSelectedShipmentId(shipment.id)
    setFormData({ trackingNumber: shipment.trackingNumber })
    setIsDeleteDialogOpen(true)
  }
  
  const handleDeleteShipment = () => {
    if (!selectedShipmentId) return
    
    deleteShipment(selectedShipmentId)
    
    toast({
      title: "Shipment Deleted",
      description: `Shipment ${formData.trackingNumber} has been removed.`
    })
    
    // Reset and close dialog
    setFormData({
      trackingNumber: "",
      origin: "",
      destination: "",
      status: "Pending",
      estimatedDelivery: "",
      items: []
    })
    setItemsText("")
    setSelectedShipmentId(null)
    setIsDeleteDialogOpen(false)
  }
  
  // Get status badge color
  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'In Transit':
        return 'bg-blue-100 text-blue-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipment Tracking</h1>
              <p className="text-gray-500">Manage and track your shipments</p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Shipment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Shipment</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new shipment.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input 
                          id="trackingNumber" 
                          name="trackingNumber" 
                          value={formData.trackingNumber || ""} 
                          onChange={handleInputChange}
                        />
                        {errors.trackingNumber && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.trackingNumber}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="origin">Origin</Label>
                        <Input 
                          id="origin" 
                          name="origin" 
                          value={formData.origin || ""} 
                          onChange={handleInputChange}
                        />
                        {errors.origin && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.origin}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="destination">Destination</Label>
                        <Input 
                          id="destination" 
                          name="destination" 
                          value={formData.destination || ""} 
                          onChange={handleInputChange}
                        />
                        {errors.destination && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.destination}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={formData.status as string || "Pending"} 
                          onValueChange={(value) => handleSelectChange("status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Transit">In Transit</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.status && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.status}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
                        <Input 
                          id="estimatedDelivery" 
                          name="estimatedDelivery" 
                          type="date" 
                          value={formData.estimatedDelivery || ""} 
                          onChange={handleInputChange}
                        />
                        {errors.estimatedDelivery && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.estimatedDelivery}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="items">Items (comma separated)</Label>
                        <Textarea 
                          id="items" 
                          name="items" 
                          value={itemsText} 
                          onChange={handleInputChange}
                          placeholder="Office Paper, Printer Ink, etc."
                        />
                        {errors.items && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.items}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddShipment}>Create Shipment</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
          
          {/* Shipments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead>Items</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-500">
                      No shipments found. {isAdmin && "Create your first shipment to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.trackingNumber}</TableCell>
                      <TableCell>{shipment.origin}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </TableCell>
                      <TableCell>{shipment.estimatedDelivery}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {shipment.items.join(', ')}
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(shipment)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(shipment)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Edit Dialog */}
          {isAdmin && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Shipment</DialogTitle>
                  <DialogDescription>
                    Update the shipment details.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-trackingNumber">Tracking Number</Label>
                    <Input 
                      id="edit-trackingNumber" 
                      name="trackingNumber" 
                      value={formData.trackingNumber || ""} 
                      onChange={handleInputChange}
                    />
                    {errors.trackingNumber && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.trackingNumber}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-origin">Origin</Label>
                    <Input 
                      id="edit-origin" 
                      name="origin" 
                      value={formData.origin || ""} 
                      onChange={handleInputChange}
                    />
                    {errors.origin && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.origin}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-destination">Destination</Label>
                    <Input 
                      id="edit-destination" 
                      name="destination" 
                      value={formData.destination || ""} 
                      onChange={handleInputChange}
                    />
                    {errors.destination && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.destination}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select 
                      value={formData.status as string || "Pending"} 
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.status}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-estimatedDelivery">Estimated Delivery Date</Label>
                    <Input 
                      id="edit-estimatedDelivery" 
                      name="estimatedDelivery" 
                      type="date" 
                      value={formData.estimatedDelivery || ""} 
                      onChange={handleInputChange}
                    />
                    {errors.estimatedDelivery && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.estimatedDelivery}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-items">Items (comma separated)</Label>
                    <Textarea 
                      id="edit-items" 
                      name="items" 
                      value={itemsText} 
                      onChange={handleInputChange}
                      placeholder="Office Paper, Printer Ink, etc."
                    />
                    {errors.items && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.items}
                      </p>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateShipment}>Update Shipment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Delete Confirmation Dialog */}
          {isAdmin && (
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete shipment "{formData.trackingNumber}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteShipment}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
  