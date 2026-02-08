// src/controllers/managerController.js
const prisma = require("../config/prismaClient");

// Get all properties for this manager
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { managerId: req.user.id },
      include: { leases: true },
    });
    res.json(properties);
  } catch (err) {
    console.error("Error fetching manager properties:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a new property
exports.createProperty = async (req, res) => {
  try {
    const { name, address } = req.body;
    const property = await prisma.property.create({
      data: {
        name,
        address,
        managerId: req.user.id,
      },
    });
    res.json(property);
  } catch (err) {
    console.error("Error creating property:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
