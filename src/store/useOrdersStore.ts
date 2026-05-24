
    import { create } from 'zustand'
    import { persist } from 'zustand/middleware'

    export type OrderStatus = 'New' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'

    export interface OrderItem {
      productId: string
      name: string
      quantity: number
      price: number
    }

    export interface Order {
      id: string
      orderNumber: string
      customer: {
        name: string
        email: string
        address: string
      }
      items: OrderItem[]
      status: OrderStatus
      totalAmount: number
      orderDate: string
      lastUpdated: string
    }

    interface OrdersState {
      orders: Order[]
      addOrder: (order: Omit<Order, 'id' | 'lastUpdated'>) => void
      updateOrder: (id: string, order: Partial<Omit<Order, 'id' | 'lastUpdated'>>) => void
      deleteOrder: (id: string) => void
      getPendingOrders: () => number
    }

    // Initial demo data
    const initialOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-2023-001',
        customer: {
          name: 'Acme Corporation',
          email: 'orders@acme.com',
          address: '123 Business Ave, New York, NY 10001'
        },
        items: [
          { productId: '1', name: 'Office Paper', quantity: 10, price: 5.99 },
          { productId: '2', name: 'Printer Ink', quantity: 2, price: 25.99 }
        ],
        status: 'Processing',
        totalAmount: 111.88,
        orderDate: '2023-07-15',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        orderNumber: 'ORD-2023-002',
        customer: {
          name: 'TechStart Inc',
          email: 'procurement@techstart.com',
          address: '456 Innovation Blvd, San Francisco, CA 94107'
        },
        items: [
          { productId: '4', name: 'Laptop', quantity: 3, price: 899.99 }
        ],
        status: 'New',
        totalAmount: 2699.97,
        orderDate: '2023-07-18',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        orderNumber: 'ORD-2023-003',
        customer: {
          name: 'Global Services LLC',
          email: 'office@globalservices.com',
          address: '789 Corporate Park, Chicago, IL 60607'
        },
        items: [
          { productId: '3', name: 'Desk Chair', quantity: 5, price: 149.99 },
          { productId: '5', name: 'Sticky Notes', quantity: 20, price: 2.49 }
        ],
        status: 'Shipped',
        totalAmount: 799.75,
        orderDate: '2023-07-10',
        lastUpdated: new Date().toISOString()
      }
    ]

    export const useOrdersStore = create<OrdersState>()(
      persist(
        (set, get) => ({
          orders: initialOrders,
          
          addOrder: (order) => {
            const newOrder = {
              ...order,
              id: Date.now().toString(),
              lastUpdated: new Date().toISOString()
            }
            set((state) => ({
              orders: [...state.orders, newOrder]
            }))
          },
          
          updateOrder: (id, updatedOrder) => {
            set((state) => ({
              orders: state.orders.map((order) => 
                order.id === id 
                  ? { 
                      ...order, 
                      ...updatedOrder, 
                      lastUpdated: new Date().toISOString() 
                    } 
                  : order
              )
            }))
          },
          
          deleteOrder: (id) => {
            set((state) => ({
              orders: state.orders.filter((order) => order.id !== id)
            }))
          },
          
          getPendingOrders: () => {
            return get().orders.filter(order => 
              order.status === 'New' || order.status === 'Processing'
            ).length
          }
        }),
        {
          name: 'logitrack-orders'
        }
      )
    )
  