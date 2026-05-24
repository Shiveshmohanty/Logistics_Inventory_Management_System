
    import { create } from 'zustand'
    import { persist } from 'zustand/middleware'

    export type ShipmentStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled'

    export interface Shipment {
      id: string
      trackingNumber: string
      origin: string
      destination: string
      status: ShipmentStatus
      estimatedDelivery: string
      items: string[]
      lastUpdated: string
    }

    interface ShipmentsState {
      shipments: Shipment[]
      addShipment: (shipment: Omit<Shipment, 'id' | 'lastUpdated'>) => void
      updateShipment: (id: string, shipment: Partial<Omit<Shipment, 'id' | 'lastUpdated'>>) => void
      deleteShipment: (id: string) => void
      getPendingShipments: () => number
      getInTransitShipments: () => number
      getDeliveredShipments: () => number
    }

    // Initial demo data
    const initialShipments: Shipment[] = [
      {
        id: '1',
        trackingNumber: 'TRK-2023-001',
        origin: 'Chicago Warehouse',
        destination: 'New York Office',
        status: 'In Transit',
        estimatedDelivery: '2023-07-25',
        items: ['Office Paper', 'Printer Ink'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        trackingNumber: 'TRK-2023-002',
        origin: 'Atlanta Warehouse',
        destination: 'Miami Office',
        status: 'Pending',
        estimatedDelivery: '2023-07-28',
        items: ['Laptop', 'Desk Chair'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        trackingNumber: 'TRK-2023-003',
        origin: 'Seattle Warehouse',
        destination: 'Portland Office',
        status: 'Delivered',
        estimatedDelivery: '2023-07-15',
        items: ['Sticky Notes', 'Printer Ink'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        trackingNumber: 'TRK-2023-004',
        origin: 'Los Angeles Warehouse',
        destination: 'San Diego Office',
        status: 'In Transit',
        estimatedDelivery: '2023-07-24',
        items: ['Office Paper', 'Desk Chair'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: '5',
        trackingNumber: 'TRK-2023-005',
        origin: 'Boston Warehouse',
        destination: 'Philadelphia Office',
        status: 'Pending',
        estimatedDelivery: '2023-07-30',
        items: ['Laptop'],
        lastUpdated: new Date().toISOString()
      }
    ]

    export const useShipmentsStore = create<ShipmentsState>()(
      persist(
        (set, get) => ({
          shipments: initialShipments,
          
          addShipment: (shipment) => {
            const newShipment = {
              ...shipment,
              id: Date.now().toString(),
              lastUpdated: new Date().toISOString()
            }
            set((state) => ({
              shipments: [...state.shipments, newShipment]
            }))
          },
          
          updateShipment: (id, updatedShipment) => {
            set((state) => ({
              shipments: state.shipments.map((shipment) => 
                shipment.id === id 
                  ? { 
                      ...shipment, 
                      ...updatedShipment, 
                      lastUpdated: new Date().toISOString() 
                    } 
                  : shipment
              )
            }))
          },
          
          deleteShipment: (id) => {
            set((state) => ({
              shipments: state.shipments.filter((shipment) => shipment.id !== id)
            }))
          },
          
          getPendingShipments: () => {
            return get().shipments.filter(shipment => shipment.status === 'Pending').length
          },
          
          getInTransitShipments: () => {
            return get().shipments.filter(shipment => shipment.status === 'In Transit').length
          },
          
          getDeliveredShipments: () => {
            return get().shipments.filter(shipment => shipment.status === 'Delivered').length
          }
        }),
        {
          name: 'logitrack-shipments'
        }
      )
    )
  