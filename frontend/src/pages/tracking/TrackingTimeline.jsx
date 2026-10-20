import { useState } from 'react'
import { trackingAPI } from '../../api'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import { MapPin, Clock } from 'lucide-react'

export default function TrackingTimeline() {
  const { trackingId } = useParams()
  const [search, setSearch] = useState(trackingId || '')
  const [query, setQuery] = useState(trackingId || '')

  const { data, isLoading, error } = useQuery({
    queryKey: ['tracking', query],
    queryFn: () => trackingAPI.getTimeline(query).then((r) => r.data),
    enabled: !!query,
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Track Shipment</h1>

      <div className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter tracking ID..."
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <button onClick={() => setQuery(search)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700">Track</button>
      </div>

      {isLoading && <Spinner />}
      {error && <p className="text-red-500 text-sm">Shipment not found</p>}

      {data && (
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-mono text-sm text-indigo-600">{data.trackingId}</p>
              <p className="text-xs text-gray-400">
                {data.estimatedDelivery ? `Est. Delivery: ${new Date(data.estimatedDelivery).toLocaleDateString()}` : ''}
              </p>
            </div>
            <StatusBadge status={data.currentStatus} />
          </div>

          {data.currentLocation?.city && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={14} /> {data.currentLocation.city}, {data.currentLocation.country}
            </div>
          )}

          {/* Timeline */}
          <div className="relative pl-6 space-y-4 border-l-2 border-indigo-100">
            {data.timeline?.map((event, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <StatusBadge status={event.status} />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {event.location?.city && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={11} />{event.location.city}, {event.location.country}</p>}
                  {event.note && <p className="text-xs text-gray-600 mt-1">{event.note}</p>}
                  {event.updatedBy && <p className="text-xs text-gray-400 mt-1">By: {event.updatedBy.name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
