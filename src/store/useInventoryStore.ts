
    import { create } from 'zustand'
    import { persist } from 'zustand/middleware'

    export interface Product {
      id: string
      name: string
      quantity: number
      sku: string
      location: string
      category: string
      lastUpdated: string
    }

    interface InventoryState {
      products: Product[]
      addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void
      updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'lastUpdated'>>) => void
      deleteProduct: (id: string) => void
      getLowStockItems: () => number
      getTotalProducts: () => number
    }

    // Initial demo data
    const initialProducts: Product[] = [
      {
        id: '1',
        name: 'Office Paper',
        quantity: 150,
        sku: 'PAP-001',
        location: 'Warehouse A',
        category: 'Office Supplies',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Printer Ink',
        quantity: 5,
        sku: 'INK-002',
        location: 'Warehouse B',
        category: 'Office Supplies',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Desk Chair',
        quantity: 12,
        sku: 'FRN-003',
        location: 'Warehouse A',
        category: 'Furniture',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Laptop',
        quantity: 8,
        sku: 'ELC-004',
        location: 'Warehouse C',
        category: 'Electronics',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Sticky Notes',
        quantity: 45,
        sku: 'PAP-005',
        location: 'Warehouse A',
        category: 'Office Supplies',
        lastUpdated: new Date().toISOString()
      }
    ]

    export const useInventoryStore = create<InventoryState>()(
      persist(
        (set, get) => ({
          products: initialProducts,
          
          addProduct: (product) => {
            const newProduct = {
              ...product,
              id: Date.now().toString(),
              lastUpdated: new Date().toISOString()
            }
            set((state) => ({
              products: [...state.products, newProduct]
            }))
          },
          
          updateProduct: (id, updatedProduct) => {
            set((state) => ({
              products: state.products.map((product) => 
                product.id === id 
                  ? { 
                      ...product, 
                      ...updatedProduct, 
                      lastUpdated: new Date().toISOString() 
                    } 
                  : product
              )
            }))
          },
          
          deleteProduct: (id) => {
            set((state) => ({
              products: state.products.filter((product) => product.id !== id)
            }))
          },
          
          getLowStockItems: () => {
            // Consider items with quantity less than 10 as low stock
            return get().products.filter(product => product.quantity < 10).length
          },
          
          getTotalProducts: () => {
            return get().products.length
          }
        }),
        {
          name: 'logitrack-inventory'
        }
      )
    )
  