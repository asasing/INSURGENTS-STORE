import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../common/Spinner'

export default function ProtectedRoute({ children }) {
  const { user, loading, hasProfile } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    )
  }

  // Allow any user with a profile (admin, staff, or viewer)
  if (!user || !hasProfile) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
