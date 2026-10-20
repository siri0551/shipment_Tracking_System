import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../api'
import Spinner from '../../components/ui/Spinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

export default function Analytics() {
  const { data: overview, isLoading: l1 } = useQuery({ queryKey: ['overview'], queryFn: () => analyticsAPI.overview().then((r) => r.data.overview) })
  const { data: byStatus } = useQuery({ queryKey: ['byStatus'], queryFn: () => analyticsAPI.byStatus().then((r) => r.data.data) })
  const { data: daily } = useQuery({ queryKey: ['daily'], queryFn: () => analyticsAPI.daily(30).then((r) => r.data.data) })
  const { data: carriers } = useQuery({ queryKey: ['carriers'], queryFn: () => analyticsAPI.carrierPerformance().then((r) => r.data.data) })
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: () => analyticsAPI.topRoutes().then((r) => r.data.data) })

  if (l1) return <Spinner size="lg" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: overview?.total, color: 'text-indigo-600' },
          { label: 'Delivered', value: overview?.delivered, color: 'text-green-600' },
          { label: 'Delayed', value: overview?.delayed, color: 'text-orange-600' },
          { label: 'Delivery Rate', value: overview?.deliveryRate, color: 'text-blue-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Pie */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Shipments by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id }) => _id}>
                {byStatus?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Daily Trend (30 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#6366f1" name="Total" />
              <Line type="monotone" dataKey="delivered" stroke="#22c55e" name="Delivered" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Carrier Performance */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Carrier Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={carriers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="carrierName" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#6366f1" name="Total" />
              <Bar dataKey="delivered" fill="#22c55e" name="Delivered" />
              <Bar dataKey="delayed" fill="#f59e0b" name="Delayed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Top Routes</h2>
          <div className="space-y-2">
            {routes?.map((r, i) => (
              <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                <span className="text-gray-700">{r.from} → {r.to}</span>
                <span className="font-semibold text-indigo-600">{r.count} shipments</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
