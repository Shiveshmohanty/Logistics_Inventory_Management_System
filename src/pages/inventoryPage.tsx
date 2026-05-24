
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
    import { AlertCircle, Plus, Pencil, Trash2 } from "lucide-react"
    import { useInventoryStore, Product } from "@/store/useInventoryStore"
    import { useToast } from "@/hooks/use-toast"
    import { useAuthStore } from "@/store/useAuthStore"

    export default function InventoryPage() {
      const { products, addProduct, updateProduct, deleteProduct } = useInventoryStore()
      const { toast } = useToast()
      const { user } = useAuthStore()
      const isAdmin = user?.role === 'admin'
      
      // Form state
      const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
      const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        quantity: 0,
        sku: "",
        location: "",
        category: ""
      })
      const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
      const [errors, setErrors] = useState<Record<string, string>>({})
      
      // Form handlers
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({
          ...formData,
          [name]: name === "quantity" ? parseInt(value) || 0 : value
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
        
        if (!formData.name?.trim()) {
          newErrors.name = "Product name is required"
        }
        
        if (!formData.sku?.trim()) {
          newErrors.sku = "SKU is required"
        }
        
        if (!formData.location?.trim()) {
          newErrors.location = "Location is required"
        }
        
        if (!formData.category?.trim()) {
          newErrors.category = "Category is required"
        }
        
        if (formData.quantity === undefined || formData.quantity < 0) {
          newErrors.quantity = "Quantity must be 0 or higher"
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
      }
      
      // Add new product
      const handleAddProduct = () => {
        if (!validateForm()) return
        
        addProduct(formData as Omit<Product, 'id' | 'lastUpdated'>)
        
        toast({
          title: "Product Added",
          description: `${formData.name} has been added to inventory.`
        })
        
        // Reset form and close dialog
        setFormData({
          name: "",
          quantity: 0,
          sku: "",
          location: "",
          category: ""
        })
        setIsAddDialogOpen(false)
      }
      
      // Edit product
      const handleEditClick = (product: Product) => {
        setSelectedProductId(product.id)
        setFormData({
          name: product.name,
          quantity: product.quantity,
          sku: product.sku,
          location: product.location,
          category: product.category
        })
        setIsEditDialogOpen(true)
      }
      
      const handleUpdateProduct = () => {
        if (!validateForm() || !selectedProductId) return
        
        updateProduct(selectedProductId, formData)
        
        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated.`
        })
        
        // Reset form and close dialog
        setFormData({
          name: "",
          quantity: 0,
          sku: "",
          location: "",
          category: ""
        })
        setSelectedProductId(null)
        setIsEditDialogOpen(false)
      }
      
      // Delete product
      const handleDeleteClick = (product: Product) => {
        setSelectedProductId(product.id)
        setFormData({ name: product.name })
        setIsDeleteDialogOpen(true)
      }
      
      const handleDeleteProduct = () => {
        if (!selectedProductId) return
        
        deleteProduct(selectedProductId)
        
        toast({
          title: "Product Deleted",
          description: `${formData.name} has been removed from inventory.`
        })
        
        // Reset and close dialog
        setFormData({
          name: "",
          quantity: 0,
          sku: "",
          location: "",
          category: ""
        })
        setSelectedProductId(null)
        setIsDeleteDialogOpen(false)
      }
      
      return (
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                  <p className="text-gray-500">Manage your product inventory</p>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                        <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                          Enter the details of the new product to add to inventory.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Product Name</Label>
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
                          <Label htmlFor="sku">SKU</Label>
                          <Input 
                            id="sku" 
                            name="sku" 
                            value={formData.sku || ""} 
                            onChange={handleInputChange}
                          />
                          {errors.sku && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.sku}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input 
                            id="quantity" 
                            name="quantity" 
                            type="number" 
                            value={formData.quantity || 0} 
                            onChange={handleInputChange}
                          />
                          {errors.quantity && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.quantity}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="location">Location</Label>
                          <Select 
                            value={formData.location || ""} 
                            onValueChange={(value) => handleSelectChange("location", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                              <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                              <SelectItem value="Warehouse C">Warehouse C</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.location && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.location}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            value={formData.category || ""} 
                            onValueChange={(value) => handleSelectChange("category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                              <SelectItem value="Electronics">Electronics</SelectItem>
                              <SelectItem value="Furniture">Furniture</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.category && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.category}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddProduct}>Add Product</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
              )}
                  </div>
                  
                <SidebarTrigger className="md:hidden" />
              </div>
              
              {/* Product Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Last Updated</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-500">
                          No products found. {isAdmin && "Add your first product to get started."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>
                            <span className={`${product.quantity < 10 ? 'text-amber-600 font-medium' : ''}`}>
                              {product.quantity}
                            </span>
                          </TableCell>
                          <TableCell>{product.location}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{new Date(product.lastUpdated).toLocaleDateString()}</TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditClick(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteClick(product)}
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
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>
                      Update the product details.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Product Name</Label>
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
                      <Label htmlFor="edit-sku">SKU</Label>
                      <Input 
                        id="edit-sku" 
                        name="sku" 
                        value={formData.sku || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.sku && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.sku}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quantity">Quantity</Label>
                      <Input 
                        id="edit-quantity" 
                        name="quantity" 
                        type="number" 
                        value={formData.quantity || 0} 
                        onChange={handleInputChange}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.quantity}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Select 
                        value={formData.location || ""} 
                        onValueChange={(value) => handleSelectChange("location", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                          <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                          <SelectItem value="Warehouse C">Warehouse C</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.location && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.location}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Select 
                        value={formData.category || ""} 
                        onValueChange={(value) => handleSelectChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Furniture">Furniture</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.category}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateProduct}>Update Product</Button>
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
                      Are you sure you want to delete "{formData.name}"? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              )}
            </main>
          </div>
        </SidebarProvider>
      )
    }
  