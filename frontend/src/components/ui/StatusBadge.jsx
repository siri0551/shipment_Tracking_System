const STATUS_COLORS = {
  Created: 'bg-gray-100 text-gray-700',
  'Picked Up': 'bg-blue-100 text-blue-700',
  'In Transit': 'bg-yellow-100 text-yellow-700',
  Warehouse: 'bg-purple-100 text-purple-700',
  'Out for Delivery': 'bg-orange-100 text-orange-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
