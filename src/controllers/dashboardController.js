export const getAdminDashboard = (req, res) => {
  res.json({
    totalProperties: 12,
    totalManagers: 4,
    totalTenants: 87,
    totalRevenue: 532000,
    arrears: 12000,
    recentPayments: [
      { tenant: "James Kariuki", amount: 25000 },
      { tenant: "Mary Njoroge", amount: 18000 },
      { tenant: "Kevin Mwangi", amount: 30000 }
    ]
  });
};

export const getClientDashboard = (req, res) => {
  res.json({
    totalProperties: 12,
    totalManagers: 4,
    totalTenants: 87,
    totalRevenue: 532000,
    arrears: 12000,
    recentPayments: [
      { tenant: "James Kariuki", amount: 25000 },
      { tenant: "Mary Njoroge", amount: 18000 },
      { tenant: "Kevin Mwangi", amount: 30000 }
    ]
  });
};

export const getPropertyManagerDashboard = (req, res) => {
  res.json({
    totalProperties: 12,
    totalManagers: 4,
    totalTenants: 87,
    totalRevenue: 532000,
    arrears: 12000,
    recentPayments: [
      { tenant: "James Kariuki", amount: 25000 },
      { tenant: "Mary Njoroge", amount: 18000 },
      { tenant: "Kevin Mwangi", amount: 30000 }
    ]
  });
};

export const getTenantDashboard = (req, res) => {
  res.json({
    totalProperties: 12,
    totalManagers: 4,
    totalTenants: 87,
    totalRevenue: 532000,
    arrears: 12000,
    recentPayments: [
      { tenant: "James Kariuki", amount: 25000 },
      { tenant: "Mary Njoroge", amount: 18000 },
      { tenant: "Kevin Mwangi", amount: 30000 }
    ]
  });
};
