// Vehicle routes
import express from "express";
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addVehicleLoad,
  removeVehicleLoad,
  getVehicleLoads,
  getMyVehicle
} from "../controllers/vehicle.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Vehicle CRUD routes
router.get("/my-vehicle", getMyVehicle);
router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

// Vehicle load routes
router.get("/:id/loads", getVehicleLoads);
router.post("/:id/loads", addVehicleLoad);
router.delete("/:id/loads/:loadId", removeVehicleLoad);

export default router;
