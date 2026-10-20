import { useState } from 'react'
import { qrAPI } from '../api'
import { QRCodeSVG } from 'qrcode.react'
import Spinner from '../components/ui/Spinner'

export default function QRPage() {
  const [trackingId, setTrackingId] = useState('')
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFetch = async () => {
    if (!trackingId) return
    setLoading(true); setError('')
    try {
      const res = await qrAPI.get(trackingId)
      setQrData(res.data)
    } catch {
      setError('Shipment not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">QR Code Lookup</h1>

      <div className="flex gap-2">
        <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter tracking ID..."
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <button onClick={handleFetch} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700">
          Get QR
        </button>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {qrData && (
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-4">
          <QRCodeSVG value={`${window.location.origin}/track/${qrData.trackingId}`} size={220} />
          <p className="font-mono text-sm text-indigo-600">{qrData.trackingId}</p>
          <a href={`/track/${qrData.trackingId}`}
            className="text-sm text-indigo-600 hover:underline">Open Tracking Page</a>
        </div>
      )}
    </div>
  )
}
