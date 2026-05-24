
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  usedSpace: number
  manager: string
  contact: string
  status: 'Active' | 'Maintenance' | 'Inactive'
}

interface WarehousesState {
  warehouses: Warehouse[]
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => void
  updateWarehouse: (id: string, warehouseData: Partial<Warehouse>) => void
  deleteWarehouse: (id: string) => void
  getWarehouseById: (id: string) => Warehouse | undefined
}

// Mock warehouses for demonstration
const initialWarehouses: Warehouse[] = [
  {
    id: '1',
    name: 'Warehouse A',
    location: 'New York, NY',
    capacity: 10000,
    usedSpace: 6500,
    manager: 'John Smith',
    contact: '555-123-4567',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Warehouse B',
    location: 'Los Angeles, CA',
    capacity: 8000,
    usedSpace: 5200,
    manager: 'Emily Davis',
    contact: '555-987-6543',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Warehouse C',
    location: 'Chicago, IL',
    capacity: 12000,
    usedSpace: 3800,
    manager: 'Robert Johnson',
    contact: '555-456-7890',
    status: 'Maintenance'
  }
]

export const useWarehousesStore = create<WarehousesState>()(
  persist(
    (set, get) => ({
      warehouses: initialWarehouses,
      
      addWarehouse: (warehouseData) => {
        // Ensure usedSpace doesn't exceed capacity
        const usedSpace = Math.min(warehouseData.usedSpace, warehouseData.capacity)
        
        const newWarehouse = {
          ...warehouseData,
          usedSpace,
          id: Math.random().toString(36).substring(2, 9)
        }
        
        set((state) => ({
          warehouses: [...state.warehouses, newWarehouse]
        }))
      },
      
      updateWarehouse: (id, warehouseData) => {
        set((state) => ({
          warehouses: state.warehouses.map((warehouse) => {
            if (warehouse.id === id) {
              // If both capacity and usedSpace are being updated, ensure usedSpace doesn't exceed capacity
              if (warehouseData.capacity !== undefined && warehouseData.usedSpace !== undefined) {
                return { 
                  ...warehouse, 
                  ...warehouseData,
                  usedSpace: Math.min(warehouseData.usedSpace, warehouseData.capacity)
                }
              }
              
              // If only capacity is being updated and it's less than current usedSpace
              if (warehouseData.capacity !== undefined && warehouseData.capacity < warehouse.usedSpace) {
                return {
                  ...warehouse,
                  ...warehouseData,
                  usedSpace: warehouseData.capacity
                }
              }
              
              return { ...warehouse, ...warehouseData }
            }
            return warehouse
          })
        }))
      },
      
      deleteWarehouse: (id) => {
        set((state) => ({
          warehouses: state.warehouses.filter((warehouse) => warehouse.id !== id)
        }))
      },
      
      getWarehouseById: (id) => {
        return get().warehouses.find((warehouse) => warehouse.id === id)
      }
    }),
    {
      name: 'logitrack-warehouses'
    }
  )
)
  