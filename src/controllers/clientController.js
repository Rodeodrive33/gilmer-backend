const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Clients see all unleased properties
exports.getAvailableProperties = async (req, res) => {
  try {
    const leasedPropertyIds = await prisma.lease.findMany({
      select: { propertyId: true },
      distinct: ["propertyId"],
    });

    const leasedIds = leasedPropertyIds.map(l => l.propertyId);

    const available = await prisma.property.findMany({
      where: { id: { notIn: leasedIds } },
    });

    res.json(available);
  } catch (err) {
    console.error("Error fetching available properties:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
