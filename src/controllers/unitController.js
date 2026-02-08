// src/controllers/unitController.js
import prisma from "../config/prismaClient.js";

export async function createUnit(req, res) {
  try {
    const { unitNumber, rentAmount, propertyId } = req.body;

    if (!["ADMIN", "PROPERTY_MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const unit = await prisma.unit.create({
      data: {
        unitNumber,
        rentAmount: parseFloat(rentAmount),
        propertyId: Number(propertyId),
      },
    });

    res.status(201).json(unit);
  } catch (err) {
    console.error("❌ Error creating unit:", err);
    res.status(500).json({ error: "Failed to create unit" });
  }
}

export async function listUnits(req, res) {
  try {
    let where = {};

    if (req.user.role === "PROPERTY_MANAGER") {
      where = { property: { propertyManagerId: req.user.id } };
    } else if (req.user.role === "CLIENT") {
      where = { property: { clientId: req.user.id } };
    } else if (req.user.role === "TENANT") {
      where = { tenant: { userId: req.user.id } };
    }

    const units = await prisma.unit.findMany({
      where,
      include: { property: true, tenant: true },
    });

    res.json(units);
  } catch (err) {
    console.error("❌ Error listing units:", err);
    res.status(500).json({ error: "Failed to fetch units" });
  }
}

export async function getUnitById(req, res) {
  try {
    const { id } = req.params;
    const unit = await prisma.unit.findUnique({
      where: { id: Number(id) },
      include: { property: true, tenant: true },
    });
    res.json(unit);
  } catch (err) {
    console.error("❌ Error fetching unit:", err);
    res.status(500).json({ error: "Failed to fetch unit" });
  }
}
