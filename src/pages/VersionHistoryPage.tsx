
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, Clock, Calendar, ArrowDownToLine } from "lucide-react"

export default function VersionHistoryPage() {
  // This would be populated from a real history store in a production app
  const mockVersions = [
    { 
      id: "v1", 
      date: "Jul 20, 2023", 
      time: "14:32:45", 
      user: "Admin User", 
      changes: "Initial setup", 
      type: "major"
    },
    { 
      id: "v2", 
      date: "Jul 21, 2023", 
      time: "09:15:22", 
      user: "Admin User", 
      changes: "Added inventory items", 
      type: "minor"
    },
    { 
      id: "v3", 
      date: "Jul 22, 2023", 
      time: "11:45:10", 
      user: "John Smith", 
      changes: "Updated warehouse locations", 
      type: "minor"
    },
    { 
      id: "v4", 
      date: "Jul 23, 2023", 
      time: "16:20:33", 
      user: "Sarah Johnson", 
      changes: "Added new users", 
      type: "major"
    },
    { 
      id: "v5", 
      date: "Jul 24, 2023", 
      time: "10:05:18", 
      user: "Admin User", 
      changes: "System settings update", 
      type: "minor"
    }
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Version History</h1>
              <p className="text-gray-500">View and restore previous versions of your system</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-1">
                <ArrowDownToLine className="h-4 w-4" />
                Export History
              </Button>
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Changes</TabsTrigger>
                <TabsTrigger value="major">Major Versions</TabsTrigger>
                <TabsTrigger value="auto">Auto-Saves</TabsTrigger>
              </TabsList>
              
              <Select defaultValue="7days">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hours">Last 24 Hours</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <TabsContent value="all" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Version History</CardTitle>
                  <CardDescription>
                    Browse through previous versions and restore if needed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockVersions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {version.type === "major" ? (
                                <Calendar className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-600" />
                              )}
                              {version.id}
                            </div>
                          </TableCell>
                          <TableCell>{version.date}</TableCell>
                          <TableCell>{version.time}</TableCell>
                          <TableCell>{version.user}</TableCell>
                          <TableCell>{version.changes}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-1">
                                <RotateCcw className="h-3 w-3" />
                                Restore
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-amber-100 p-1">
                    <RotateCcw className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">About Version History</h3>
                    <p className="text-xs text-amber-700 mt-1">
                      The system automatically saves versions when major changes are made. You can restore
                      to any previous version at any time. Restoring will replace the current state with 
                      the selected version.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="major">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500 py-8">
                    Only major version points are shown in this view.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="auto">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500 py-8">
                    Automatic saves occur every 30 minutes when changes are detected.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  )
}
  