const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!["ADMIN", "MANAGER", "TENANT", "CLIENT"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};




