import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Package, LayoutDashboard, MapPin, QrCode, History, ShieldCheck, BarChart3, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Manufacturer', 'Carrier', 'Warehouse', 'Distributor', 'Customer'] },
  { label: 'Shipments', icon: Package, path: '/shipments', roles: ['Admin', 'Manufacturer', 'Carrier', 'Warehouse', 'Distributor'] },
  { label: 'Tracking', icon: MapPin, path: '/tracking', roles: ['Admin', 'Manufacturer', 'Carrier', 'Warehouse', 'Distributor', 'Customer'] },
  { label: 'QR Scanner', icon: QrCode, path: '/qr', roles: ['Admin', 'Manufacturer', 'Carrier', 'Warehouse', 'Distributor', 'Customer'] },
  { label: 'History', icon: History, path: '/history', roles: ['Admin', 'Manufacturer', 'Carrier'] },
  { label: 'Tamper Check', icon: ShieldCheck, path: '/tamper', roles: ['Admin'] },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['Admin'] },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const filtered = navItems.filter((i) => i.roles.includes(user?.role))

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Package size={22} /> ShipTrack
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {filtered.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-1 px-3 py-2 rounded text-sm hover:bg-indigo-600 transition ${location.pathname.startsWith(item.path) ? 'bg-indigo-800' : ''}`}>
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm opacity-80">{user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-red-300">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-indigo-800 px-4 pb-4 flex flex-col gap-1">
          {filtered.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-indigo-600">
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-300">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  )
}
