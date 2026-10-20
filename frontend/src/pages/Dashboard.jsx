import { useQuery } from '@tanstack/react-query'
import { analyticsAPI, shipmentAPI } from '../api'
import useAuthStore from '../store/authStore'
import { Package, Truck, CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import StatusBadge from '../components/ui/StatusBadge'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}><Icon size={22} className="text-white" /></div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['overview'],
    queryFn: () => analyticsAPI.overview().then((r) => r.data.overview),
    enabled: isAdmin,
  })

  const { data: shipmentsData, isLoading: loadingShipments } = useQuery({
    queryKey: ['shipments', 'recent'],
    queryFn: () => shipmentAPI.getAll({ limit: 5 }).then((r) => r.data),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 👋</h1>

      {isAdmin && (
        loadingOverview ? <Spinner /> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Package} label="Total" value={overview?.total} color="bg-indigo-500" />
            <StatCard icon={CheckCircle} label="Delivered" value={overview?.delivered} color="bg-green-500" />
            <StatCard icon={Truck} label="In Transit" value={overview?.inTransit} color="bg-yellow-500" />
            <StatCard icon={Clock} label="Delayed" value={overview?.delayed} color="bg-orange-500" />
            <StatCard icon={XCircle} label="Cancelled" value={overview?.cancelled} color="bg-red-500" />
            <StatCard icon={Users} label="Users" value={overview?.totalUsers} color="bg-purple-500" />
          </div>
        )
      )}

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">Recent Shipments</h2>
          <Link to="/shipments" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {loadingShipments ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Tracking ID</th>
                <th className="pb-2">Product</th>
                <th className="pb-2">Destination</th>
                <th className="pb-2">Status</th>
              </tr></thead>
              <tbody>
                {shipmentsData?.shipments?.map((s) => (
                  <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2">
                      <Link to={`/shipments/${s._id}`} className="text-indigo-600 hover:underline font-mono text-xs">{s.trackingId}</Link>
                    </td>
                    <td className="py-2">{s.product.name}</td>
                    <td className="py-2">{s.destination.city}, {s.destination.country}</td>
                    <td className="py-2"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
