// backend/scripts/seedUsers.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin Utama
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      nama: 'Admin Utama',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      createdAt: new Date(),
    },
  });

  // Sekretaris
  await prisma.user.upsert({
    where: { email: 'sekretaris@gmail.com' },
    update: {},
    create: {
      nama: 'Sekretaris Gereja',
      email: 'sekretaris@gmail.com',
      password: hashedPassword,
      role: 'SEKRETARIS',
      createdAt: new Date(),
    },
  });

  // Bendahara
  await prisma.user.upsert({
    where: { email: 'bendahara@gmail.com' },
    update: {},
    create: {
      nama: 'Bendahara Gereja',
      email: 'bendahara@gmail.com',
      password: hashedPassword,
      role: 'BENDAHARA',
      createdAt: new Date(),
    },
  });

  console.log('✅ 3 pengguna berhasil dibuat!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
