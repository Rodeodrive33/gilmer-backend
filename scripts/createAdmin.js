// scripts/createAdmin.js
const adminSdk = require('../src/firebase/firebaseAdmin');
const prisma = require('../prismaClient');

async function run() {
  try {
    const email = 'rooneywanjohi@gmail.com'; // change if different
    const password = 'Wanjohi@1971'; // use a secure password
    let u;
    try {
      u = await adminSdk.auth().getUserByEmail(email);
    } catch {
      u = await adminSdk.auth().createUser({ email, password });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'admin' },
      create: { email, role: 'admin' },
    });

    await adminSdk.auth().setCustomUserClaims(u.uid, { role: 'admin' });
    console.log('Admin ready:', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

module.exports = run;