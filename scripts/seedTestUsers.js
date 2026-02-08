// scripts/seedTestUsers.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed admin user
  await prisma.user.upsert({
    where: { email: 'admin@gilmer.com' },
    update: {},
    create: {
      email: 'admin@gilmer.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  console.log('✅ Test users seeded successfully');
}


main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  
