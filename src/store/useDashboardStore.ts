
    import { create } from 'zustand'
    import { useInventoryStore } from './useInventoryStore'
    import { useShipmentsStore } from './useShipmentsStore'
    import { useOrdersStore } from './useOrdersStore'

    // Dashboard state now pulls data from the other stores
    interface DashboardState {
      totalProducts: number
      lowStockItems: number
      pendingShipments: number
      inTransitShipments: number
      deliveredShipments: number
      pendingOrders: number
      refreshData: () => void
    }

    export const useDashboardStore = create<DashboardState>((set) => ({
      totalProducts: useInventoryStore.getState().getTotalProducts(),
      lowStockItems: useInventoryStore.getState().getLowStockItems(),
      pendingShipments: useShipmentsStore.getState().getPendingShipments(),
      inTransitShipments: useShipmentsStore.getState().getInTransitShipments(),
      deliveredShipments: useShipmentsStore.getState().getDeliveredShipments(),
      pendingOrders: useOrdersStore.getState().getPendingOrders(),
      
      refreshData: () => {
        set({
          totalProducts: useInventoryStore.getState().getTotalProducts(),
          lowStockItems: useInventoryStore.getState().getLowStockItems(),
          pendingShipments: useShipmentsStore.getState().getPendingShipments(),
          inTransitShipments: useShipmentsStore.getState().getInTransitShipments(),
          deliveredShipments: useShipmentsStore.getState().getDeliveredShipments(),
          pendingOrders: useOrdersStore.getState().getPendingOrders(),
        })
      }
    }))

    // Subscribe to changes in the stores
    useInventoryStore.subscribe(() => {
      useDashboardStore.getState().refreshData()
    })

    useShipmentsStore.subscribe(() => {
      useDashboardStore.getState().refreshData()
    })

    useOrdersStore.subscribe(() => {
      useDashboardStore.getState().refreshData()
    })
  