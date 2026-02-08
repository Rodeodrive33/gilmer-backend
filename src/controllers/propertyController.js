// src/controllers/propertyController.js
import prisma from "../config/prismaClient.js";

/**
 * Admin or Client creates a new property
 */
export async function createProperty(req, res) {
  try {
    const { name, address, clientId, propertyManagerId } = req.body;

    // Only Admin or Client can create
    if (!["ADMIN", "CLIENT"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const property = await prisma.property.create({
      data: {
        name,
        address,
        clientId: clientId ? Number(clientId) : null,
        propertyManagerId: propertyManagerId ? Number(propertyManagerId) : null,
      },
    });

    res.status(201).json(property);
  } catch (err) {
    console.error("❌ Error creating property:", err);
    res.status(500).json({ error: "Failed to create property" });
  }
}

/**
 * Get all properties (filtered by role)
 */
export async function listProperties(req, res) {
  try {
    let properties;

    switch (req.user.role) {
      case "ADMIN":
        properties = await prisma.property.findMany({
          include: { propertyManager: true, client: true },
        });
        break;

      case "PROPERTY_MANAGER":
        properties = await prisma.property.findMany({
          where: { propertyManagerId: req.user.id },
          include: { propertyManager: true, client: true },
        });
        break;

      case "CLIENT":
        properties = await prisma.property.findMany({
          where: { clientId: req.user.id },
          include: { propertyManager: true, client: true },
        });
        break;

      default:
        return res
          .status(403)
          .json({ error: "Tenants cannot view property list" });
    }

    res.json(properties);
  } catch (err) {
    console.error("❌ Error fetching properties:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
}

/**
 * Get single property (visible only if allowed)
 */
export async function getProperty(req, res) {
  try {
    const id = Number(req.params.id);

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyManager: true,
        client: true,
        units: { include: { tenant: true } },
      },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Access control
    if (
      req.user.role === "PROPERTY_MANAGER" &&
      property.propertyManagerId !== req.user.id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (
      req.user.role === "CLIENT" &&
      property.clientId !== req.user.id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(property);
  } catch (err) {
    console.error("❌ Error fetching property:", err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
}

/**
 * Admin updates property
 */
export async function updateProperty(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, address, clientId, propertyManagerId } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    const property = await prisma.property.update({
      where: { id },
      data: { name, address, clientId, propertyManagerId },
    });

    res.json(property);
  } catch (err) {
    console.error("❌ Error updating property:", err);
    res.status(500).json({ error: "Failed to update property" });
  }
}

/**
 * Admin deletes property
 */
export async function deleteProperty(req, res) {
  try {
    const id = Number(req.params.id);

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.property.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    console.error("❌ Error deleting property:", err);
    res.status(500).json({ error: "Failed to delete property" });
  }
}

export default {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
};
