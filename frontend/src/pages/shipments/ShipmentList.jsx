import { useQuery } from '@tanstack/react-query'
import { shipmentAPI } from '../../api'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import useAuthStore from '../../store/authStore'
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'

const STATUSES = ['', 'Created', 'Picked Up', 'In Transit', 'Warehouse', 'Out for Delivery', 'Delivered', 'Cancelled']

export default function ShipmentList() {
  const { user } = useAuthStore()
  const [params, setParams] = useState({ page: 1, limit: 10, search: '', status: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', params],
    queryFn: () => shipmentAPI.getAll(params).then((r) => r.data),
  })

  const canCreate = ['Admin', 'Manufacturer'].includes(user?.role)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Shipments</h1>
        {canCreate && (
          <Link to="/shipments/new" className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            <Plus size={16} /> New Shipment
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={16} className="text-gray-400" />
          <input placeholder="Search tracking ID, product..." className="text-sm outline-none w-full"
            value={params.search} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} />
        </div>
        <select className="border rounded-lg px-3 py-2 text-sm"
          value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}>
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {isLoading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="px-4 py-3">Tracking ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {data?.shipments?.map((s) => (
                <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600">{s.trackingId}</td>
                  <td className="px-4 py-3">{s.product.name}</td>
                  <td className="px-4 py-3">{s.source.city}</td>
                  <td className="px-4 py-3">{s.destination.city}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link to={`/shipments/${s._id}`} className="text-indigo-600 hover:underline text-xs">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Total: {data.total} shipments</span>
          <div className="flex gap-2">
            <button disabled={params.page === 1} onClick={() => setParams({ ...params, page: params.page - 1 })}
              className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
            <span className="px-3 py-1">Page {params.page} of {data.pages}</span>
            <button disabled={params.page >= data.pages} onClick={() => setParams({ ...params, page: params.page + 1 })}
              className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
