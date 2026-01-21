import * as InventoryService from "../services/inventory.service.js";

// Get all inventory items
export const getAllInventory = async (req, res) => {
  try {
    const items = await InventoryService.getAllInventory();
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory",
    });
  }
};

// Get inventory item by ID
export const getInventoryById = async (req, res) => {
  try {
    const item = await InventoryService.getInventoryById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE new inventory item
export const createInventory = async (req, res) => {
  try {
    console.log('Creating inventory item with data:', req.body);
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'stock', 'unit', 'price', 'supplier'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    const item = await InventoryService.createInventory(req.body);

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: item,
    });
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create inventory item",
    });
  }
};

// Update inventory item
export const updateInventory = async (req, res) => {
  try {
    const item = await InventoryService.updateInventory(req.params.id, req.body);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete inventory item
export const deleteInventory = async (req, res) => {
  try {
    const result = await InventoryService.deleteInventory(req.params.id);

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update stock quantity
export const updateStock = async (req, res) => {
  try {
    const item = await InventoryService.updateStock(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: item,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};