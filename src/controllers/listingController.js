// src/controllers/listingController.js
import prisma from "../config/prismaClient.js";

/**
 * Create a unit (used as a listing). Roles: ADMIN, PROPERTY_MANAGER, CLIENT
 * Body: { unitNumber, rentAmount, propertyId }
 */
export async function createListing(req, res) {
  try {
    const { unitNumber, rentAmount, propertyId } = req.body;

    // Only Admin / Manager / Client may create units
    if (!["ADMIN", "PROPERTY_MANAGER", "CLIENT"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const unit = await prisma.unit.create({
      data: {
        unitNumber,
        rentAmount: parseFloat(rentAmount),
        propertyId: Number(propertyId),
        // tenantId left null => vacancy
      },
    });

    return res.status(201).json({ message: "Listing created", unit });
  } catch (err) {
    console.error("❌ createListing error:", err);
    res.status(500).json({ error: "Failed to create listing" });
  }
}

/**
 * List vacancies (units without tenants). Open to all authenticated users.
 * Query params:
 *  - q (search unitNumber or property name)
 *  - propertyId (optional)
 */
export async function listVacancies(req, res) {
  try {
    const q = req.query.q || "";
    const propertyId = req.query.propertyId ? Number(req.query.propertyId) : undefined;

    const where = {
      tenantId: null,
      AND: [
        propertyId ? { propertyId } : {},
        q
          ? {
              OR: [
                { unitNumber: { contains: q, mode: "insensitive" } },
                { property: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    };

    const units = await prisma.unit.findMany({
      where,
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: units });
  } catch (err) {
    console.error("❌ listVacancies error:", err);
    res.status(500).json({ error: "Failed to list vacancies" });
  }
}

/**
 * Manager/Client/Admin: list their own listings
 * Admin sees everything.
 */
export async function manageListings(req, res) {
  try {
    let where = {};

    switch (req.user.role) {
      case "PROPERTY_MANAGER":
        where = { property: { propertyManagerId: req.user.id } };
        break;
      case "CLIENT":
        where = { property: { clientId: req.user.id } };
        break;
      case "ADMIN":
        where = {}; // all
        break;
      default:
        return res.status(403).json({ error: "Access denied" });
    }

    const units = await prisma.unit.findMany({
      where,
      include: { property: true, tenant: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: units });
  } catch (err) {
    console.error("❌ manageListings error:", err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}

/**
 * Assign tenant to unit (move-in) — Admin or Property Manager only
 * Body: { unitId, tenantId }
 */
export async function assignTenantToUnit(req, res) {
  try {
    if (!["ADMIN", "PROPERTY_MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { unitId, tenantId } = req.body;
    if (!unitId || !tenantId) return res.status(422).json({ error: "unitId and tenantId required" });

    // Ensure unit exists and is vacant
    const unit = await prisma.unit.findUnique({ where: { id: Number(unitId) } });
    if (!unit) return res.status(404).json({ error: "Unit not found" });
    if (unit.tenantId) return res.status(400).json({ error: "Unit already occupied" });

    // Ensure tenant exists and not already assigned
    const tenant = await prisma.tenant.findUnique({ where: { id: Number(tenantId) } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    if (tenant.unitId) return res.status(400).json({ error: "Tenant already assigned a unit" });

    // Assign: update Unit. Also connect tenant.unitId
    await prisma.unit.update({
      where: { id: Number(unitId) },
      data: { tenantId: Number(tenantId) },
    });

    await prisma.tenant.update({
      where: { id: Number(tenantId) },
      data: { unitId: Number(unitId) },
    });

    // Record move-in
    await prisma.moveRecord.create({
      data: {
        tenantId: Number(tenantId),
        propertyId: unit.propertyId,
        type: "MOVE_IN",
      },
    });

    res.json({ message: "Tenant assigned to unit (move-in) successfully" });
  } catch (err) {
    console.error("❌ assignTenantToUnit error:", err);
    res.status(500).json({ error: "Failed to assign tenant" });
  }
}

/**
 * Unassign tenant from unit (move-out)
 * Body: { unitId, tenantId }
 * Admin / Property Manager only
 */
export async function unassignTenantFromUnit(req, res) {
  try {
    if (!["ADMIN", "PROPERTY_MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { unitId, tenantId } = req.body;
    if (!unitId || !tenantId) return res.status(422).json({ error: "unitId and tenantId required" });

    const unit = await prisma.unit.findUnique({ where: { id: Number(unitId) } });
    if (!unit) return res.status(404).json({ error: "Unit not found" });

    if (unit.tenantId !== Number(tenantId)) {
      return res.status(400).json({ error: "Tenant is not assigned to this unit" });
    }

    // Remove assignment
    await prisma.unit.update({
      where: { id: Number(unitId) },
      data: { tenantId: null },
    });

    await prisma.tenant.update({
      where: { id: Number(tenantId) },
      data: { unitId: null },
    });

    // Record move-out
    await prisma.moveRecord.create({
      data: {
        tenantId: Number(tenantId),
        propertyId: unit.propertyId,
        type: "MOVE_OUT",
      },
    });

    res.json({ message: "Tenant unassigned from unit (move-out) successfully" });
  } catch (err) {
    console.error("❌ unassignTenantFromUnit error:", err);
    res.status(500).json({ error: "Failed to unassign tenant" });
  }
}
