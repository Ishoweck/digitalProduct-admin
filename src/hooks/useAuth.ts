// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

interface UserPayload {
  id: string
  email: string
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPERADMIN'
  exp: number
}

export const useAuth = () => {
  const [user, setUser] = useState<UserPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const decoded = jwtDecode<UserPayload>(token)

      if (decoded.exp * 1000 > Date.now()) {
        setUser(decoded)
      } else {
        Cookies.remove('token')
        setUser(null)
      }
    } catch (err) {
      console.error('Invalid token:', err)
      Cookies.remove('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { user, loading }
}
