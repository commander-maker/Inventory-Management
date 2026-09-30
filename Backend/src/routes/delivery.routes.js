// Delivery routes
import express from "express";
import { 
  getAllDeliveries, 
  getAgentDeliveries,
  getDeliveryById, 
  createDelivery, 
  updateDeliveryStatus, 
  deleteDelivery 
} from "../controllers/delivery.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Specific routes MUST come before parameterized routes
router.get("/my-deliveries", getAgentDeliveries); // Agent: get their deliveries
router.post("/", createDelivery); // Create delivery

// Parameterized routes
router.get("/", getAllDeliveries); // Get all deliveries
router.get("/:id", getDeliveryById);
router.put("/:id/status", updateDeliveryStatus); // Agent updates their delivery status
router.delete("/:id", deleteDelivery); // Delete delivery

export default router;
