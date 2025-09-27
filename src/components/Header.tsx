import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { logout } = useAuth()

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="font-semibold text-lg">Admin Panel</div>
      <div>
        <button
          onClick={logout}
          className="px-3 py-1 border rounded text-primary border-primary hover:bg-primary hover:text-white transition"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
