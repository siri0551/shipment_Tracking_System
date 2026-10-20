import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { shipmentAPI, blockchainAPI, qrAPI, historyAPI } from '../../api'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

export default function ShipmentDetail() {
  const { id } = useParams()
  const { user } = useAuthStore()

  const { data: shipment, isLoading, refetch } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => shipmentAPI.getOne(id).then((r) => r.data.shipment),
  })

  const { data: history } = useQuery({
    queryKey: ['history', id],
    queryFn: () => historyAPI.getById(id).then((r) => r.data.history),
  })

  const handleRegisterBlockchain = async () => {
    try {
      await blockchainAPI.register(id)
      toast.success('Registered on blockchain!')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  if (isLoading) return <Spinner size="lg" />

  const trackingUrl = `${window.location.origin}/track/${shipment?.trackingId}`

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{shipment?.product.name}</h1>
          <p className="text-sm font-mono text-indigo-600">{shipment?.trackingId}</p>
        </div>
        <StatusBadge status={shipment?.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Details */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow p-5 grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-400">From</p><p className="font-medium">{shipment?.source.city}, {shipment?.source.country}</p></div>
            <div><p className="text-gray-400">To</p><p className="font-medium">{shipment?.destination.city}, {shipment?.destination.country}</p></div>
            <div><p className="text-gray-400">Receiver</p><p className="font-medium">{shipment?.receiver.name}</p></div>
            <div><p className="text-gray-400">Quantity</p><p className="font-medium">{shipment?.product.quantity}</p></div>
            <div><p className="text-gray-400">Carrier</p><p className="font-medium">{shipment?.carrier?.name || 'Not assigned'}</p></div>
            <div><p className="text-gray-400">Est. Delivery</p><p className="font-medium">{shipment?.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'N/A'}</p></div>
            {shipment?.blockchainTxHash && (
              <div className="col-span-2"><p className="text-gray-400">Blockchain Tx</p>
                <p className="font-mono text-xs text-green-600 break-all">{shipment.blockchainTxHash}</p></div>
            )}
          </div>

          {/* Actions */}
          {['Admin', 'Manufacturer'].includes(user?.role) && !shipment?.contractShipmentId && (
            <button onClick={handleRegisterBlockchain}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
              Register on Blockchain
            </button>
          )}

          {/* History */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Shipment History</h2>
            <div className="space-y-2">
              {history?.map((h, i) => (
                <div key={i} className="flex gap-3 text-sm border-b pb-2 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium">{h.action}</p>
                    <p className="text-gray-400 text-xs">{new Date(h.createdAt).toLocaleString()} · {h.performedBy?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center gap-3">
          <h2 className="font-semibold text-gray-700">QR Code</h2>
          <QRCodeSVG value={trackingUrl} size={180} />
          <p className="text-xs text-gray-400 text-center break-all">{trackingUrl}</p>
          <Link to={`/tracking/${shipment?.trackingId}`}
            className="text-sm text-indigo-600 hover:underline">View Tracking Timeline</Link>
        </div>
      </div>
    </div>
  )
}
