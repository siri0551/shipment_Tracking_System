const paginate = (query, req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  return { query: query.skip(skip).limit(limit), page, limit, skip };
};

const buildShipmentFilter = (req) => {
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.country) filter["destination.country"] = req.query.country;
  if (req.query.city) filter["destination.city"] = new RegExp(req.query.city, "i");

  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }

  if (req.query.search) {
    filter.$or = [
      { trackingId: new RegExp(req.query.search, "i") },
      { "product.name": new RegExp(req.query.search, "i") },
      { "receiver.name": new RegExp(req.query.search, "i") },
    ];
  }

  return filter;
};

module.exports = { paginate, buildShipmentFilter };
