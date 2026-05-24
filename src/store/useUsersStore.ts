
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  joinDate: string
  lastActive: string
}

interface UsersState {
  users: User[]
  addUser: (user: Omit<User, 'id' | 'lastActive'>) => void
  updateUser: (id: string, userData: Partial<User>) => void
  deleteUser: (id: string) => void
  getUserById: (id: string) => User | undefined
}

// Mock users for demonstration
const initialUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@hexawinds.com',
    role: 'admin',
    department: 'Management',
    joinDate: '2023-01-15',
    lastActive: '2023-07-20'
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@hexawinds.com',
    role: 'user',
    department: 'Warehouse',
    joinDate: '2023-02-10',
    lastActive: '2023-07-19'
  },
  {
    id: '3',
    name: 'John Smith',
    email: 'john@hexawinds.com',
    role: 'user',
    department: 'Shipping',
    joinDate: '2023-03-22',
    lastActive: '2023-07-18'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@hexawinds.com',
    role: 'admin',
    department: 'IT',
    joinDate: '2023-01-05',
    lastActive: '2023-07-20'
  }
]

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      
      addUser: (userData) => {
        const newUser = {
          ...userData,
          id: Math.random().toString(36).substring(2, 9),
          lastActive: new Date().toISOString().split('T')[0]
        }
        
        set((state) => ({
          users: [...state.users, newUser]
        }))
      },
      
      updateUser: (id, userData) => {
        set((state) => ({
          users: state.users.map((user) => 
            user.id === id ? { 
              ...user, 
              ...userData,
              lastActive: new Date().toISOString().split('T')[0] 
            } : user
          )
        }))
      },
      
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id)
        }))
      },
      
      getUserById: (id) => {
        return get().users.find((user) => user.id === id)
      }
    }),
    {
      name: 'logitrack-users'
    }
  )
)
  