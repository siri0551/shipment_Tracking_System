import { useForm } from 'react-hook-form'
import { shipmentAPI } from '../../api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function CreateShipment() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      const payload = {
        product: { name: data.productName, description: data.productDesc, quantity: Number(data.quantity), weight: Number(data.weight), category: data.category },
        source: { address: data.sourceAddress, city: data.sourceCity, country: data.sourceCountry },
        destination: { address: data.destAddress, city: data.destCity, country: data.destCountry },
        receiver: { name: data.receiverName, email: data.receiverEmail, phone: data.receiverPhone },
        estimatedDelivery: data.estimatedDelivery || null,
      }
      const res = await shipmentAPI.create(payload)
      toast.success('Shipment created!')
      navigate(`/shipments/${res.data.shipment._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shipment')
    }
  }

  const Field = ({ label, name, required, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} placeholder={placeholder}
        {...register(name, required ? { required: `${label} is required` } : {})}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Shipment</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Product Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Name" name="productName" required />
            <Field label="Category" name="category" />
            <Field label="Quantity" name="quantity" required type="number" />
            <Field label="Weight (kg)" name="weight" type="number" />
            <div className="col-span-2"><Field label="Description" name="productDesc" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Source</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Address" name="sourceAddress" required /></div>
            <Field label="City" name="sourceCity" required />
            <Field label="Country" name="sourceCountry" required />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Destination</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Address" name="destAddress" required /></div>
            <Field label="City" name="destCity" required />
            <Field label="Country" name="destCountry" required />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Receiver</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" name="receiverName" required />
            <Field label="Email" name="receiverEmail" required />
            <Field label="Phone" name="receiverPhone" />
            <Field label="Estimated Delivery" name="estimatedDelivery" type="date" />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Create Shipment'}
        </button>
      </form>
    </div>
  )
}
