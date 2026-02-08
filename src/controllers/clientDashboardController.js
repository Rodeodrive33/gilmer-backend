// src/controllers/clientDashboardController.js
export async function getClientDashboard(req, res) {
  try {
    const client = {
      name: req.user?.email || "Client User",
      totalRevenue: 75000,
      propertiesManaged: 5,
      arrears: 4200,
      recentTransactions: [
        { date: "2025-10-05", type: "Rent", amount: 12000 },
        { date: "2025-09-05", type: "Rent", amount: 11500 },
      ],
    };

    res.status(200).json(client);
  } catch (error) {
    console.error("Client Dashboard Error:", error);
    res.status(500).json({ error: "Failed to fetch client dashboard data" });
  }
}
