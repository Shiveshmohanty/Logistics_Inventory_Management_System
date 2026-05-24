
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
import { useUsersStore, User, UserRole } from "@/store/useUsersStore"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useUsersStore()
  const { toast } = useToast()
  
  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "user",
    department: "",
    joinDate: new Date().toISOString().split('T')[0]
  })
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
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
      newErrors.name = "Name is required"
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!formData.role) {
      newErrors.role = "Role is required"
    }
    
    if (!formData.department?.trim()) {
      newErrors.department = "Department is required"
    }
    
    if (!formData.joinDate?.trim()) {
      newErrors.joinDate = "Join date is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Add new user
  const handleAddUser = () => {
    if (!validateForm()) return
    
    addUser(formData as Omit<User, 'id' | 'lastActive'>)
    
    toast({
      title: "User Added",
      description: `${formData.name} has been added as a ${formData.role}.`
    })
    
    // Reset form and close dialog
    setFormData({
      name: "",
      email: "",
      role: "staff",
      department: "",
      joinDate: new Date().toISOString().split('T')[0]
    })
    setIsAddDialogOpen(false)
  }
  
  // Edit user
  const handleEditClick = (user: User) => {
    setSelectedUserId(user.id)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      joinDate: user.joinDate
    })
    setIsEditDialogOpen(true)
  }
  
  const handleUpdateUser = () => {
    if (!validateForm() || !selectedUserId) return
    
    updateUser(selectedUserId, formData)
    
    toast({
      title: "User Updated",
      description: `${formData.name}'s information has been updated.`
    })
    
    // Reset form and close dialog
    setFormData({
      name: "",
      email: "",
      role: "staff",
      department: "",
      joinDate: new Date().toISOString().split('T')[0]
    })
    setSelectedUserId(null)
    setIsEditDialogOpen(false)
  }
  
  // Delete user
  const handleDeleteClick = (user: User) => {
    setSelectedUserId(user.id)
    setFormData({ name: user.name })
    setIsDeleteDialogOpen(true)
  }
  
  const handleDeleteUser = () => {
    if (!selectedUserId) return
    
    deleteUser(selectedUserId)
    
    toast({
      title: "User Deleted",
      description: `${formData.name} has been removed from the system.`
    })
    
    // Reset and close dialog
    setFormData({
      name: "",
      email: "",
      role: "staff",
      department: "",
      joinDate: new Date().toISOString().split('T')[0]
    })
    setSelectedUserId(null)
    setIsDeleteDialogOpen(false)
  }
  
  // Get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    return role === 'admin' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500">Manage system users and permissions</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Enter the details to create a new user account.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
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
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        value={formData.email || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={formData.role as string || "staff"} 
                        onValueChange={(value) => handleSelectChange("role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.role}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={formData.department || ""} 
                        onValueChange={(value) => handleSelectChange("department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Management">Management</SelectItem>
                          <SelectItem value="Warehouse">Warehouse</SelectItem>
                          <SelectItem value="Shipping">Shipping</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Customer Service">Customer Service</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.department}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="joinDate">Join Date</Label>
                      <Input 
                        id="joinDate" 
                        name="joinDate" 
                        type="date" 
                        value={formData.joinDate || ""} 
                        onChange={handleInputChange}
                      />
                      {errors.joinDate && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.joinDate}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddUser}>Add User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
          
          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found. Add your first user to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.role === 'admin' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(user)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteClick(user)}
                            disabled={users.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update the user information.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
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
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email"
                    value={formData.email || ""} 
                    onChange={handleInputChange}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.email}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={formData.role as string || "staff"} 
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.role}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Select 
                    value={formData.department || ""} 
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                      <SelectItem value="Shipping">Shipping</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Customer Service">Customer Service</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.department}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-joinDate">Join Date</Label>
                  <Input 
                    id="edit-joinDate" 
                    name="joinDate" 
                    type="date" 
                    value={formData.joinDate || ""} 
                    onChange={handleInputChange}
                  />
                  {errors.joinDate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.joinDate}
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateUser}>Update User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete user "{formData.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  )
}
  