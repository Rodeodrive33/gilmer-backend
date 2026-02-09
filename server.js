import "dotenv/config"; // loads .env

import express from "express";
import http from "http";
import { Server } from "socket.io";
import dashboardRoutes from "./src/routes/dashboard.js";
import mpesaRoutes from "./src/routes/mpesa.js";
import cron from "node-cron";
import { batchInvoices } from "./src/services/invoiceBatchService.js";


cron.schedule("0 0 * * *", batchInvoices);



const app = express();
app.use(express.json());

const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*" } // allow frontend access
});

// Example event for new invoice
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mpesa", mpesaRoutes);


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

import { generateMonthlyInvoices } from "./src/services/invoiceBatcher.js";

cron.schedule("0 0 1 * *", async () => {
  console.log("Running monthly invoice batch...");
  await generateMonthlyInvoices();
});
import { createServer } from "http";



global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


