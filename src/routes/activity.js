import express from "express";
import { prisma } from "../config/prisma.js";
import { io } from "../../server.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Log action
router.post("/", authenticate, async (req, res) => {
  const { action, entity, entityId } = req.body;

  const log = await prisma.activityLog.create({
    data: {
      action,
      entity,
      entityId,
      userId: req.user.id
    }
  });

  io.emit("activity-log", log);
  res.json(log);
});

export default router;
