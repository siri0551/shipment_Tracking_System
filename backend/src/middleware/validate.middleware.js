const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("Admin", "Manufacturer", "Carrier", "Warehouse", "Distributor", "Customer"),
  walletAddress: Joi.string().allow(null, ""),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const shipmentSchema = Joi.object({
  product: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(""),
    quantity: Joi.number().min(1).required(),
    weight: Joi.number().allow(null),
    category: Joi.string().allow(""),
  }).required(),
  source: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  destination: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  receiver: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(""),
  }).required(),
  carrier: Joi.string().allow(null, ""),
  estimatedDelivery: Joi.date().allow(null),
});

const trackingUpdateSchema = Joi.object({
  status: Joi.string()
    .valid("Created", "Picked Up", "In Transit", "Warehouse", "Out for Delivery", "Delivered", "Cancelled")
    .required(),
  location: Joi.object({
    address: Joi.string().allow(""),
    city: Joi.string().allow(""),
    country: Joi.string().allow(""),
    coordinates: Joi.object({
      lat: Joi.number().allow(null),
      lng: Joi.number().allow(null),
    }),
  }),
  note: Joi.string().allow(""),
});

module.exports = { validate, registerSchema, loginSchema, shipmentSchema, trackingUpdateSchema };
