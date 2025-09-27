// components/RequireSuperAdmin.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireSuperAdmin({ children }: { children: any }) {
  const { user, loading } = useAuth()

  if (loading) return null // or show a spinnerx

  if (!user || user.role !== 'SUPERADMIN') {
    return <Navigate to="/vendors" replace />
  }

  return children
}
