// src/controllers/accessController.js
import prisma from "../config/prismaClient.js";

/**
 * Log an access event (Enter/Exit). Tenant logs will use their user -> tenant mapping.
 * Body: { propertyId, action }  (action example: "ENTER", "EXIT")
 */
export async function logAccess(req, res) {
  try {
    const { propertyId, action } = req.body;
    if (!propertyId || !action) {
      return res.status(422).json({ error: "propertyId and action are required" });
    }

    // If the requester is a tenant, try to find their tenant.id from user id
    let tenantId = null;
    if (req.user.role === "TENANT") {
      const tenant = await prisma.tenant.findUnique({ where: { userId: req.user.id } });
      if (tenant) tenantId = tenant.id;
    }

    const log = await prisma.accessLog.create({
      data: {
        propertyId: Number(propertyId),
        tenantId: tenantId,
        action,
      },
    });

    res.status(201).json({ message: "Access logged", log });
  } catch (err) {
    console.error("❌ logAccess error:", err);
    res.status(500).json({ error: "Failed to log access" });
  }
}

/**
 * Get access logs (role-aware)
 * Query params: ?limit=50&page=1
 */
export async function getAccessLogs(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    let where = {};

    if (req.user.role === "TENANT") {
      // get tenant id for this user
      const tenant = await prisma.tenant.findUnique({ where: { userId: req.user.id } });
      if (!tenant) return res.status(403).json({ error: "No tenant record for this user" });
      where = { tenantId: tenant.id };
    } else if (req.user.role === "PROPERTY_MANAGER") {
      where = { property: { propertyManagerId: req.user.id } };
    } else if (req.user.role === "CLIENT") {
      where = { property: { clientId: req.user.id } };
    } // ADMIN sees everything

    const logs = await prisma.accessLog.findMany({
      where,
      include: { tenant: true, property: true },
      orderBy: { timestamp: "desc" },
      skip,
      take: limit,
    });

    res.json({ data: logs, meta: { page, limit } });
  } catch (err) {
    console.error("❌ getAccessLogs error:", err);
    res.status(500).json({ error: "Failed to fetch access logs" });
  }
}

/**
 * Log move-in or move-out. Only Admin or Property Manager should call this.
 * Body: { tenantId, propertyId, type }  (type: MOVE_IN or MOVE_OUT)
 */
export async function logMove(req, res) {
  try {
    const { tenantId, propertyId, type } = req.body;
    if (!tenantId || !propertyId || !type) {
      return res.status(422).json({ error: "tenantId, propertyId and type are required" });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: Number(tenantId) } });
    const property = await prisma.property.findUnique({ where: { id: Number(propertyId) } });

    if (!tenant || !property) {
      return res.status(404).json({ error: "Tenant or Property not found" });
    }

    // Create MoveRecord
    const record = await prisma.moveRecord.create({
      data: {
        tenantId: Number(tenantId),
        propertyId: Number(propertyId),
        type,
      },
    });

    // If MOVE_IN, optionally assign the unitId if unitId provided in body
    // But to keep it consistent we expect assign/unassign endpoints to handle unit <-> tenant linking.
    res.status(201).json({ message: "Move recorded", record });
  } catch (err) {
    console.error("❌ logMove error:", err);
    res.status(500).json({ error: "Failed to record move" });
  }
}

/**
 * Get move records (role-aware)
 * Query params: ?limit=50&page=1
 */
export async function getMoves(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    let where = {};

    if (req.user.role === "TENANT") {
      const tenant = await prisma.tenant.findUnique({ where: { userId: req.user.id } });
      if (!tenant) return res.status(403).json({ error: "No tenant record for this user" });
      where = { tenantId: tenant.id };
    } else if (req.user.role === "PROPERTY_MANAGER") {
      where = { property: { propertyManagerId: req.user.id } };
    } else if (req.user.role === "CLIENT") {
      where = { property: { clientId: req.user.id } };
    } // ADMIN sees everything

    const records = await prisma.moveRecord.findMany({
      where,
      include: { tenant: true, property: true },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    });

    res.json({ data: records, meta: { page, limit } });
  } catch (err) {
    console.error("❌ getMoves error:", err);
    res.status(500).json({ error: "Failed to fetch move records" });
  }
}
