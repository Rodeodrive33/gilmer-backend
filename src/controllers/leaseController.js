const prisma = require('../../prismaClient');

exports.createLease = async (req, res) => {
  try {
    const { propertyId, tenantId, startDate, endDate, rentAmount, serviceCharge } = req.body;
    const lease = await prisma.lease.create({
      data: {
        propertyId,
        tenantId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: parseFloat(rentAmount),
        serviceCharge: serviceCharge ? parseFloat(serviceCharge) : null,
        status: 'ACTIVE'
      }
    });
    res.status(201).json(lease);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create lease' });
  }
};

exports.getLeases = async (req, res) => {
  try {
    // For admin: all, for property_manager: only their properties
    if (req.user.role === 'ADMIN') {
      const leases = await prisma.lease.findMany({ include: { tenant: true, property: true }});
      return res.json(leases);
    } else if (req.user.role === 'PROPERTY_MANAGER') {
      // find manager's properties then leases
      const properties = await prisma.property.findMany({ where: { managerId: req.user.id }, select: { id: true }});
      const propIds = properties.map(p => p.id);
      const leases = await prisma.lease.findMany({ where: { propertyId: { in: propIds } }, include: { tenant: true, property: true }});
      return res.json(leases);
    } else {
      // tenant: only their leases
      const leases = await prisma.lease.findMany({ where: { tenantId: req.user.id }, include: { property: true }});
      return res.json(leases);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leases' });
  }
};

exports.getLeaseById = async (req, res) => {
  try {
    const lease = await prisma.lease.findUnique({ where: { id: req.params.id }, include: { tenant: true, property: true }});
    res.json(lease);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lease' });
  }
};