// src/controllers/tenantDashboardController.js
export async function getTenantDashboard(req, res) {
  try {
    const tenant = {
      name: req.user?.email || "Tenant User",
      unitNumber: "A-204",
      balance: 1200,
      rentStatus: "Pending",
      recentPayments: [
        { date: "2025-10-01", amount: 5000 },
        { date: "2025-09-01", amount: 5000 },
      ],
    };

    res.status(200).json(tenant);
  } catch (error) {
    console.error("Tenant Dashboard Error:", error);
    res.status(500).json({ error: "Failed to fetch tenant dashboard data" });
  }
}
