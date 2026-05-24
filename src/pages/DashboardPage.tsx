
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { UndoChangesGuide } from "@/components/UndoChangesGuide"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStore } from "@/store/useDashboardStore"
import { Package, TruckIcon, AlertTriangle, ShoppingCart } from "lucide-react"

export default function DashboardPage() {
  const { 
    totalProducts, 
    lowStockItems, 
    pendingShipments, 
    inTransitShipments, 
    deliveredShipments 
  } = useDashboardStore()
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Welcome to your Hexawinds inventory dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <UndoChangesGuide />
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Products */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Package className="mr-2 h-5 w-5 text-blue-500" />
                  Total Products
                </CardTitle>
                <CardDescription>Inventory count</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalProducts}</p>
              </CardContent>
            </Card>
            
            {/* Low Stock Items */}
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Low Stock Items
                </CardTitle>
                <CardDescription>Need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{lowStockItems}</p>
              </CardContent>
            </Card>
            
            {/* Pending Shipments */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 text-purple-500" />
                  Pending Orders
                </CardTitle>
                <CardDescription>Awaiting processing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingShipments}</p>
              </CardContent>
            </Card>
            
            {/* Active Shipments */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <TruckIcon className="mr-2 h-5 w-5 text-green-500" />
                  Active Shipments
                </CardTitle>
                <CardDescription>In transit</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{inTransitShipments}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest inventory and shipment updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="text-sm font-medium">New shipment created</p>
                    <p className="text-xs text-gray-500">Today at 10:30 AM</p>
                  </div>
                  <div className="border-l-2 border-green-500 pl-4 py-1">
                    <p className="text-sm font-medium">Inventory restocked: Office Supplies</p>
                    <p className="text-xs text-gray-500">Yesterday at 3:15 PM</p>
                  </div>
                  <div className="border-l-2 border-amber-500 pl-4 py-1">
                    <p className="text-sm font-medium">Low stock alert: Printer Paper</p>
                    <p className="text-xs text-gray-500">Yesterday at 1:45 PM</p>
                  </div>
                  <div className="border-l-2 border-purple-500 pl-4 py-1">
                    <p className="text-sm font-medium">New order received: #ORD-2023-8756</p>
                    <p className="text-xs text-gray-500">Jul 12, 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Shipment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Status</CardTitle>
                <CardDescription>Overview of current shipments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Pending</span>
                      <span className="text-sm text-gray-500">{pendingShipments}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${(pendingShipments / (pendingShipments + inTransitShipments + deliveredShipments)) * 100}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">In Transit</span>
                      <span className="text-sm text-gray-500">{inTransitShipments}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(inTransitShipments / (pendingShipments + inTransitShipments + deliveredShipments)) * 100}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Delivered</span>
                      <span className="text-sm text-gray-500">{deliveredShipments}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(deliveredShipments / (pendingShipments + inTransitShipments + deliveredShipments)) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
  