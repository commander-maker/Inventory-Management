// Delivery controller - Handle delivery management requests
import * as DeliveryService from "../services/delivery.service.js";

// Get all deliveries
export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await DeliveryService.getAllDeliveries();
    res.status(200).json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get agent's deliveries
export const getAgentDeliveries = async (req, res) => {
  try {
    const deliveries = await DeliveryService.getAgentDeliveries(req.user.id);
    res.status(200).json({
      success: true,
      message: `Found ${deliveries.length} deliveries`,
      data: deliveries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get delivery by ID
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await DeliveryService.getDeliveryById(req.params.id);
    
    // Agents can only view their own deliveries
    if (req.user.role === 'agent' && delivery.Vehicle.driverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this delivery"
      });
    }
    
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Create new delivery
export const createDelivery = async (req, res) => {
  try {
    const delivery = await DeliveryService.createDelivery(req.body);
    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      data: delivery
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    // Agents can only update their own deliveries
    if (req.user.role === 'agent') {
      const delivery = await DeliveryService.getDeliveryById(req.params.id);
      
      // Check if vehicle and driver info exists
      if (!delivery.Vehicle || delivery.Vehicle.driverId === null) {
        return res.status(400).json({
          success: false,
          message: "This delivery is not assigned to any vehicle"
        });
      }
      
      // Compare IDs (convert to numbers for comparison)
      if (parseInt(delivery.Vehicle.driverId) !== parseInt(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this delivery"
        });
      }
    }

    const delivery = await DeliveryService.updateDeliveryStatus(
      req.params.id,
      req.user.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      data: delivery
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete delivery
export const deleteDelivery = async (req, res) => {
  try {
    const result = await DeliveryService.deleteDelivery(req.params.id);
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
