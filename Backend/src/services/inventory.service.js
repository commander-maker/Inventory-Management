// Business logic for inventory
import prisma from "../config/db.js";

// Get all inventory items
export const getAllInventory = async () => {
  const items = await prisma.inventory.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return items;
};

// Get inventory item by ID
export const getInventoryById = async (id) => {
  const item = await prisma.inventory.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!item) throw new Error("Inventory item not found");
  return item;
};

// Create new inventory item
export const createInventory = async ({ name, category, stock, unit, price, supplier, status }) => {
  // Check if item with same name already exists
  const exists = await prisma.inventory.findFirst({
    where: { 
      name: {
        equals: name,
        mode: 'insensitive'
      }
    }
  });
  
  if (exists) throw new Error("Inventory item with this name already exists");

  const item = await prisma.inventory.create({
    data: {
      name,
      category,
      stock: parseInt(stock),
      unit,
      price: parseFloat(price),
      supplier,
      status: status || 'In Stock'
    }
  });

  return item;
};

// Update inventory item
export const updateInventory = async (id, { name, category, stock, unit, price, supplier, status }) => {
  // Check if item exists
  const item = await prisma.inventory.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!item) throw new Error("Inventory item not found");

  // Check if updating name conflicts with another item
  if (name && name !== item.name) {
    const exists = await prisma.inventory.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        NOT: {
          id: parseInt(id)
        }
      }
    });
    
    if (exists) throw new Error("Another inventory item with this name already exists");
  }

  const updatedItem = await prisma.inventory.update({
    where: { id: parseInt(id) },
    data: {
      name,
      category,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      unit,
      price: price !== undefined ? parseFloat(price) : undefined,
      supplier,
      status
    }
  });

  return updatedItem;
};

// Delete inventory item
export const deleteInventory = async (id) => {
  const item = await prisma.inventory.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!item) throw new Error("Inventory item not found");

  await prisma.inventory.delete({
    where: { id: parseInt(id) }
  });

  return { message: "Inventory item deleted successfully" };
};

// Update stock quantity
export const updateStock = async (id, { stock, operation }) => {
  const item = await prisma.inventory.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!item) throw new Error("Inventory item not found");

  let newStock;
  if (operation === 'add') {
    newStock = item.stock + parseInt(stock);
  } else if (operation === 'subtract') {
    newStock = item.stock - parseInt(stock);
    if (newStock < 0) throw new Error("Insufficient stock");
  } else {
    newStock = parseInt(stock);
  }

  // Determine status based on stock level
  let status = 'In Stock';
  if (newStock === 0) {
    status = 'Out of Stock';
  } else if (newStock < 10) {
    status = 'Low Stock';
  }

  const updatedItem = await prisma.inventory.update({
    where: { id: parseInt(id) },
    data: {
      stock: newStock,
      status
    }
  });

  return updatedItem;
};
