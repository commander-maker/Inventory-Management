// Vehicle controller - Handle vehicle management requests
import * as VehicleService from "../services/vehicle.service.js";

// Get all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleService.getAllVehicles();
    res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user's assigned vehicle (for Agents)
export const getMyVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleService.getVehicleByDriverId(req.user.id);
    if (!vehicle) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No vehicle assigned to this user"
      });
    }
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await VehicleService.getVehicleById(req.params.id);
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Create new vehicle
export const createVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleService.createVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const result = await VehicleService.deleteVehicle(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add load to vehicle
export const addVehicleLoad = async (req, res) => {
  try {
    const load = await VehicleService.addVehicleLoad(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: "Load added successfully",
      data: load
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Remove load from vehicle
export const removeVehicleLoad = async (req, res) => {
  try {
    const result = await VehicleService.removeVehicleLoad(req.params.loadId);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update vehicle load quantity (for distribution tracking)
export const updateVehicleLoad = async (req, res) => {
  try {
    const load = await VehicleService.updateVehicleLoad(req.params.loadId, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: "Load updated successfully",
      data: load
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get vehicle loads
export const getVehicleLoads = async (req, res) => {
  try {
    const loads = await VehicleService.getVehicleLoads(req.params.id);
    res.status(200).json({
      success: true,
      data: loads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
