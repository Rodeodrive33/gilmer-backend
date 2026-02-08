// scripts/seedTestData.js
const prisma = require("../prismaClient");

async function main() {
  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@gilmer.com" },
    update: {},
    create: {
      email: "admin@gilmer.com",
      name: "System Admin",
      role: "ADMIN",
      password: null,
    },
  });
  console.log("✅ Admin ready:", admin.email);

  // 2. Manager
  const manager = await prisma.user.upsert({
    where: { email: "manager@gilmer.com" },
    update: {},
    create: {
      email: "manager@gilmer.com",
      name: "Jane Manager",
      role: "MANAGER",
      password: null,
    },
  });
  console.log("✅ Manager ready:", manager.email);

  // 3. Tenant
  const tenant = await prisma.user.upsert({
    where: { email: "tenant@gilmer.com" },
    update: {},
    create: {
      email: "tenant@gilmer.com",
      name: "John Tenant",
      role: "TENANT",
      password: null,
    },
  });
  console.log("✅ Tenant ready:", tenant.email);

  // 4. Property
  const property = await prisma.property.upsert({
    where: { name: "Sample Property" },
    update: {},
    create: {
      name: "Sample Property",
      location: "Nairobi",
      managerId: manager.id,
    },
  });
  console.log("✅ Property ready:", property.name);

  // 5. Lease
  const lease = await prisma.lease.create({
    data: {
      startDate: new Date("2025-01-01T00:00:00Z"),
      endDate: new Date("2025-12-31T23:59:59Z"),
      rentAmount: 20000,
      serviceCharge: 3000,
      tenantId: tenant.id,
      propertyId: property.id,
    },
  });
  console.log("✅ Lease ready for:", tenant.email);

  // 6. Payment
  const payment = await prisma.payment.create({
    data: {
      amount: 23000,
      rentAmount: 20000,
      serviceCharge: 3000,
      method: "MPESA",
      status: "PAID",
      transactionId: "MPESA-SEED-001",
      mpesaReceipt: "RCPT-001",
      payerId: tenant.id,
      leaseId: lease.id,
      propertyId: property.id,
    },
  });
  console.log("✅ Payment created:", payment.id);
}

main()
  .catch((e) => {
    console.error("SEED ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
