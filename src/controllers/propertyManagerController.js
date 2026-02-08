const admin = require('firebase-admin');
const prisma = require('../config/prismaClient');

// REGISTER
exports.registerPropertyManager = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const userRecord = await admin.auth().createUser({
      email,
      password,
      phoneNumber: phone,
      displayName: fullName,
    });

    await prisma.propertyManager.create({
      data: {
        uid: userRecord.uid,
        fullName,
        email,
        phone,
      },
    });

    res.status(201).json({ message: 'Property Manager registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// GET ALL
exports.getAllPropertyManagers = async (req, res) => {
  try {
    const managers = await prisma.propertyManager.findMany();
    res.status(200).json(managers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch property managers' });
  }
};
