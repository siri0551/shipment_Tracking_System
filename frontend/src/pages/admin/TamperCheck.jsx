import { useState } from 'react'
import { tamperAPI } from '../../api'
import toast from 'react-hot-toast'
import Spinner from '../../components/ui/Spinner'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

export default function TamperCheck() {
  const [trackingId, setTrackingId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const { data: flagged, isLoading: loadingFlagged } = useQuery({
    queryKey: ['flagged'],
    queryFn: () => tamperAPI.flagged().then((r) => r.data),
  })

  const handleVerify = async () => {
    if (!trackingId) return
    setLoading(true)
    try {
      const res = await tamperAPI.verify(trackingId)
      setResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBatch = async () => {
    try {
      const res = await tamperAPI.batch()
      toast.success(`Batch check done. Tampered: ${res.data.tampered}`)
    } catch (err) {
      toast.error('Batch check failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tamper Detection</h1>
        <button onClick={handleBatch} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600">
          Run Batch Check
        </button>
      </div>

      {/* Single verify */}
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">Verify Single Shipment</h2>
        <div className="flex gap-2">
          <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter tracking ID..."
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <button onClick={handleVerify} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700">
            Verify
          </button>
        </div>

        {loading && <Spinner />}

        {result && (
          <div className={`rounded-lg p-4 ${result.isTampered ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center gap-2 font-semibold mb-2">
              {result.isTampered ? <ShieldAlert className="text-red-500" /> : <ShieldCheck className="text-green-500" />}
              {result.isTampered ? 'Tampered Detected!' : 'Verified — No Tampering'}
            </div>
            {result.mismatches?.length > 0 && (
              <div className="text-sm space-y-1">
                {result.mismatches.map((m, i) => (
                  <div key={i} className="text-red-600">
                    <span className="font-medium">{m.field}:</span> DB={m.offChain} | Chain={m.onChain}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flagged shipments */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Flagged Shipments ({flagged?.count || 0})</h2>
        {loadingFlagged ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Tracking ID</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Contract ID</th>
              <th className="pb-2">Created</th>
            </tr></thead>
            <tbody>
              {flagged?.shipments?.map((s) => (
                <tr key={s._id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs text-red-600">{s.trackingId}</td>
                  <td className="py-2">{s.status}</td>
                  <td className="py-2">{s.contractShipmentId}</td>
                  <td className="py-2 text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
