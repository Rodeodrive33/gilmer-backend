// src/controllers/tenantController.js
import prisma from "../config/prismaClient.js";
import { validationResult } from "express-validator";

// --- Create tenant ---
export async function createTenant(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, unitId, leaseId } = req.body;

    const existing = await prisma.tenant.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Tenant with that email or phone already exists" });
    }

    const tenant = await prisma.tenant.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        unit: unitId ? { connect: { id: Number(unitId) } } : undefined,
        lease: leaseId ? { connect: { id: Number(leaseId) } } : undefined,
        createdBy: req.user?.uid || null,
      },
    });

    res.status(201).json({ tenant });
  } catch (err) {
    next(err);
  }
}

// --- List tenants ---
export async function listTenants(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const q = req.query.q || "";

    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, tenants] = await Promise.all([
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
      data: tenants,
    });
  } catch (err) {
    next(err);
  }
}

// --- Get tenant by ID ---
export async function getTenant(req, res, next) {
  try {
    const id = Number(req.params.id);
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { unit: true, lease: true },
    });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.json({ tenant });
  } catch (err) {
    next(err);
  }
}

// --- Update tenant ---
export async function updateTenant(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, email, phone, unitId, leaseId } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        unit: unitId ? { connect: { id: Number(unitId) } } : undefined,
        lease: leaseId ? { connect: { id: Number(leaseId) } } : undefined,
      },
    });

    res.json({ tenant });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ message: "Tenant not found" });
    next(err);
  }
}

// --- Delete tenant ---
export async function deleteTenant(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.tenant.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ message: "Tenant not found" });
    next(err);
  }
}

export default {
  createTenant,
  listTenants,
  getTenant,
  updateTenant,
  deleteTenant,
};
