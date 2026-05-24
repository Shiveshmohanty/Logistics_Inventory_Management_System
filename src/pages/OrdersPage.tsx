
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
import { useOrdersStore, Order, OrderStatus } from "@/store/useOrdersStore"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/useAuthStore"

export default function OrdersPage() {
  const { orders, addOrder, updateOrder, deleteOrder } = useOrdersStore()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  
  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Order>>({
    orderNumber: "",
    customer: {
      name: "",
      email: "",
      address: ""
    },
    items: [],
    status: "New",
    totalAmount: 0,
    orderDate: new Date().toISOString().split('T')[0]
  })
  const [itemsText, setItemsText] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === "customerName") {
      setFormData({
        ...formData,
        customer: {
          ...formData.customer!,
          name: value
        }
      })
    } else if (name === "customerEmail") {
      setFormData({
        ...formData,
        customer: {
          ...formData.customer!,
          email: value
        }
      })
    } else if (name === "customerAddress") {
      setFormData({
        ...formData,
        customer: {
          ...formData.customer!,
          address: value
        }
      })
    } else if (name === "items") {
      setItemsText(value)
    } else if (name === "totalAmount") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      })
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
    
    if (!formData.orderNumber?.trim()) {
      newErrors.orderNumber = "Order number is required"
    }
    
    if (!formData.customer?.name?.trim()) {
      newErrors.customerName = "Customer name is required"
    }
    
    if (!formData.customer?.email?.trim()) {
      newErrors.customerEmail = "Customer email is required"
    }
    
    if (!formData.customer?.address?.trim()) {
      newErrors.customerAddress = "Customer address is required"
    }
    
    if (!formData.status) {
      newErrors.status = "Status is required"
    }
    
    if (!formData.orderDate?.trim()) {
      newErrors.orderDate = "Order date is required"
    }
    
    if (formData.totalAmount === undefined || formData.totalAmount <= 0) {
      newErrors.totalAmount = "Total amount must be greater than 0"
    }
    
    if (!itemsText.trim()) {
      newErrors.items = "At least one item is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const prepareFormData = () => {
    // Parse items from text area - format: "Product Name, Quantity, Price"
    const items = itemsText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const [name, quantityStr, priceStr] = line.split(',').map(item => item.trim())
        const quantity = parseInt(quantityStr) || 1
        const price = parseFloat(priceStr) || 0
        
        return {
          productId: Math.random().toString(36).substring(2),
          name,
          quantity,
          price
        }
      })
    
    return {
      ...formData,
      items
    }
  }
  
  // Add new order
  const handleAddOrder = () => {
    if (!validateForm()) return
    
    const newOrder = prepareFormData() as Omit<Order, 'id' | 'lastUpdated'>
    addOrder(newOrder)
    
    toast({
      title: "Order Added",
      description: `Order ${formData.orderNumber} has been created.`
    })
    
    // Reset form and close dialog
    setFormData({
      orderNumber: "",
      customer: {
        name: "",
        email: "",
        address: ""
      },
      items: [],
      status: "New",
      totalAmount: 0,
      orderDate: new Date().toISOString().split('T')[0]
    })
    setItemsText("")
    setIsAddDialogOpen(false)
  }
  
  // Edit order
  const handleEditClick = (order: Order) => {
    setSelectedOrderId(order.id)
    setFormData({
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        address: order.customer.address
      },
      status: order.status,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate
    })
    
    const itemsTextValue = order.items
      .map(item => `${item.name}, ${item.quantity}, ${item.price}`)
      .join('\n')
    
    setItemsText(itemsTextValue)
    setIsEditDialogOpen(true)
  }
  
  const handleUpdateOrder = () => {
    if (!validateForm() || !selectedOrderId) return
    
    const updatedOrder = prepareFormData()
    updateOrder(selectedOrderId, updatedOrder)
    
    toast({
      title: "Order Updated",
      description: `Order ${formData.orderNumber} has been updated.`
    })
    
    // Reset form and close dialog
    setFormData({
      orderNumber: "",
      customer: {
        name: "",
        email: "",
        address: ""
      },
      items: [],
      status: "New",
      totalAmount: 0,
      orderDate: new Date().toISOString().split('T')[0]
    })
    setItemsText("")
    setSelectedOrderId(null)
    setIsEditDialogOpen(false)
  }
  
  // Delete order
  const handleDeleteClick = (order: Order) => {
    setSelectedOrderId(order.id)
    setFormData({ orderNumber: order.orderNumber })
    setIsDeleteDialogOpen(true)
  }
  
  const handleDeleteOrder = () => {
    if (!selectedOrderId) return
    
    deleteOrder(selectedOrderId)
    
    toast({
      title: "Order Deleted",
      description: `Order ${formData.orderNumber} has been removed.`
    })
    
    // Reset and close dialog
    setFormData({
      orderNumber: "",
      customer: {
        name: "",
        email: "",
        address: ""
      },
      items: [],
      status: "New",
      totalAmount: 0,
      orderDate: new Date().toISOString().split('T')[0]
    })
    setItemsText("")
    setSelectedOrderId(null)
    setIsDeleteDialogOpen(false)
  }
  
  // Get status badge color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-800'
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
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-500">View and manage customer orders</p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Order</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new customer order.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="orderNumber">Order Number</Label>
                          <Input 
                            id="orderNumber" 
                            name="orderNumber" 
                            value={formData.orderNumber || ""} 
                            onChange={handleInputChange}
                          />
                          {errors.orderNumber && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.orderNumber}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="orderDate">Order Date</Label>
                          <Input 
                            id="orderDate" 
                            name="orderDate" 
                            type="date" 
                            value={formData.orderDate || ""} 
                            onChange={handleInputChange}
                          />
                          {errors.orderDate && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.orderDate}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Customer Information</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Input 
                              id="customerName" 
                              name="customerName" 
                              placeholder="Customer Name"
                              value={formData.customer?.name || ""} 
                              onChange={handleInputChange}
                            />
                            {errors.customerName && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.customerName}
                              </p>
                            )}
                          </div>
                          
                          <div className="grid gap-2">
                            <Input 
                              id="customerEmail" 
                              name="customerEmail" 
                              type="email"
                              placeholder="Email Address"
                              value={formData.customer?.email || ""} 
                              onChange={handleInputChange}
                            />
                            {errors.customerEmail && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.customerEmail}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Input 
                            id="customerAddress" 
                            name="customerAddress" 
                            placeholder="Shipping Address"
                            value={formData.customer?.address || ""} 
                            onChange={handleInputChange}
                          />
                          {errors.customerAddress && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.customerAddress}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="status">Order Status</Label>
                          <Select 
                            value={formData.status as string || "New"} 
                            onValueChange={(value) => handleSelectChange("status", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="New">New</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
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
                          <Label htmlFor="totalAmount">Total Amount ($)</Label>
                          <Input 
                            id="totalAmount" 
                            name="totalAmount" 
                            type="number" 
                            step="0.01"
                            value={formData.totalAmount || ""} 
                            onChange={handleInputChange}
                          />
                          {errors.totalAmount && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.totalAmount}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="items">Order Items (Product Name, Quantity, Price - one per line)</Label>
                        <Textarea 
                          id="items" 
                          name="items" 
                          value={itemsText} 
                          onChange={handleInputChange}
                          placeholder="Office Chair, 2, 149.99
Laptop, 1, 899.99"
                          rows={4}
                        />
                        {errors.items && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.items}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Enter each item on a new line in the format: Product Name, Quantity, Price
                        </p>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddOrder}>Create Order</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
          
          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-500">
                      No orders found. {isAdmin && "Create your first order to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(order)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(order)}
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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Order</DialogTitle>
                  <DialogDescription>
                    Update the order details.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-orderNumber">Order Number</Label>
                      <Input 
                        id="edit-orderNumber" 
                        name="orderNumber" 
                        value={formData.orderNumber || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.orderNumber && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.orderNumber}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="edit-orderDate">Order Date</Label>
                      <Input 
                        id="edit-orderDate" 
                        name="orderDate" 
                        type="date" 
                        value={formData.orderDate || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.orderDate && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.orderDate}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Customer Information</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Input 
                          id="edit-customerName" 
                          name="customerName" 
                          placeholder="Customer Name"
                          value={formData.customer?.name || ""} 
                          onChange={handleInputChange}
                        />
                        {errors.customerName && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.customerName}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Input 
                          id="edit-customerEmail" 
                          name="customerEmail" 
                          type="email"
                          placeholder="Email Address"
                          value={formData.customer?.email || ""} 
                          onChange={handleInputChange}
                        />
                        {errors.customerEmail && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.customerEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Input 
                        id="edit-customerAddress" 
                        name="customerAddress" 
                        placeholder="Shipping Address"
                        value={formData.customer?.address || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.customerAddress && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.customerAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Order Status</Label>
                      <Select 
                        value={formData.status as string || "New"} 
                        onValueChange={(value) => handleSelectChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
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
                      <Label htmlFor="edit-totalAmount">Total Amount ($)</Label>
                      <Input 
                        id="edit-totalAmount" 
                        name="totalAmount" 
                        type="number" 
                        step="0.01"
                        value={formData.totalAmount || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.totalAmount && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.totalAmount}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-items">Order Items (Product Name, Quantity, Price - one per line)</Label>
                    <Textarea 
                      id="edit-items" 
                      name="items" 
                      value={itemsText} 
                      onChange={handleInputChange}
                      placeholder="Office Chair, 2, 149.99
Laptop, 1, 899.99"
                      rows={4}
                    />
                    {errors.items && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.items}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Enter each item on a new line in the format: Product Name, Quantity, Price
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateOrder}>Update Order</Button>
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
                    Are you sure you want to delete order "{formData.orderNumber}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteOrder}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
  