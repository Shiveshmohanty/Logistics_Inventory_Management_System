
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'user'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
}

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@hexawinds.com',
    password: 'admin123',
    role: 'admin' as UserRole
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@hexawinds.com',
    password: 'staff123',
    role: 'user' as UserRole
  }
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // In a real app, this would be an API call
        const user = mockUsers.find(
          (u) => u.email === email && u.password === password
        )

        if (user) {
          const { password: _, ...userWithoutPassword } = user
          set({ 
            user: userWithoutPassword, 
            isAuthenticated: true 
          })
          return true
        }
        return false
      },

      register: async (name: string, email: string, password: string, role: UserRole) => {
        // Check if email already exists
        const existingUser = mockUsers.find(u => u.email === email)
        if (existingUser) {
          return false
        }

        // In a real app, this would be an API call
        const newUser = {
          id: String(mockUsers.length + 1),
          name,
          email,
          password,
          role
        }

        mockUsers.push(newUser)
        
        const { password: _, ...userWithoutPassword } = newUser
        set({ 
          user: userWithoutPassword, 
          isAuthenticated: true 
        })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      }
    }),
    {
      name: 'logitrack-auth'
    }
  )
)
  