// src/controllers/statisticsController.js
// Minimal controller that returns data for admin. Replace with Prisma logic later.
export async function getDashboardStatistics(req, res) {
  try {
    // req.user contains decoded Firebase token (uid/email/claims)
    const user = req.user || {};

    // Example response (use real Prisma aggregations later)
    const stats = {
      totalRevenue: 1250000,
      totalArrears: 82000,
      leasedUnits: 42,
      unleasedUnits: 8,
      paymentChannels: { mpesa: 60, bank: 30, cash: 10 },
      fetchedFor: { uid: user.uid, email: user.email },
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error("Statistics controller error:", err);
    return res.status(500).json({ error: "Failed to fetch statistics" });
  }
}
