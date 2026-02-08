// src/routes/manager.js
const express = require("express");
const router = express.Router();
const { getMyProperties, createProperty } = require("../controllers/managerController");
const authenticate = require("../middleware/authenticate");
import { authorize } from "../middleware/authorize.js";

// Only MANAGER can use these routes
router.get("/properties", authenticate, authorize("MANAGER"), getMyProperties);
router.post("/properties", authenticate, authorize("MANAGER"), createProperty);

module.exports = router;
