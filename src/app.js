// src/app.js
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const propertyManagerRoutes = require("./routes/propertyManager"); // old test route
const adminRoutes = require("./routes/admin");
const managerRoutes = require("./routes/manager");
const tenantRoutes = require("./routes/tenants");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/property-managers", propertyManagerRoutes); // keep for testing
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/tenant", tenantRoutes);


app.get("/", (req, res) => {
    res.send("Gilmer Backend is running...");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});


module.exports = app;

