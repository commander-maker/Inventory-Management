// Vehicle service - Business logic for vehicle management
import prisma from "../config/db.js";

// Get all vehicles
export const getAllVehicles = async () => {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      },
      loads: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return vehicles;
};

// Get vehicle by ID (registration number)
export const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      },
      loads: true
    }
  });

  if (!vehicle) throw new Error("Vehicle not found");
  return vehicle;
};

// Get vehicle by Driver ID (Agent's assigned vehicle)
export const getVehicleByDriverId = async (driverId) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { driverId: parseInt(driverId) },
    include: {
      loads: true,
      driver: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      }
    }
  });

  return vehicle; // Returns null if no vehicle is assigned, which is handled by controller
};

// Create new vehicle
export const createVehicle = async ({ id, vehicleType, capacity, status, location, fuelLevel, driverId }) => {
  // Check if vehicle already exists
  const exists = await prisma.vehicle.findUnique({ where: { id } });
  if (exists) throw new Error("Vehicle with this registration number already exists");

  // Verify driver exists if driverId is provided
  if (driverId) {
    const driver = await prisma.user.findUnique({ where: { id: parseInt(driverId) } });
    if (!driver) throw new Error("Driver not found");
    if (driver.role !== 'agent') throw new Error("Only agents can be assigned as drivers");

    // Check if this agent is already assigned to another vehicle
    const existingAssignment = await prisma.vehicle.findFirst({
      where: { driverId: parseInt(driverId) }
    });
    if (existingAssignment) {
      throw new Error(`Agent "${driver.name}" is already assigned to vehicle ${existingAssignment.id}. Each agent can only be assigned to one vehicle.`);
    }
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      id,
      vehicleType,
      capacity,
      status: status || 'Active',
      location,
      fuelLevel: fuelLevel !== undefined ? parseInt(fuelLevel) : 100,
      driverId: driverId ? parseInt(driverId) : null
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      },
      loads: true
    }
  });

  return vehicle;
};

// Update vehicle
export const updateVehicle = async (id, { vehicleType, capacity, status, location, fuelLevel, driverId }) => {
  // Check if vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new Error("Vehicle not found");

  // Verify driver exists if driverId is provided
  if (driverId) {
    const driver = await prisma.user.findUnique({ where: { id: parseInt(driverId) } });
    if (!driver) throw new Error("Driver not found");
    if (driver.role !== 'agent') throw new Error("Only agents can be assigned as drivers");

    // Check if this agent is already assigned to another vehicle (not this one)
    const existingAssignment = await prisma.vehicle.findFirst({
      where: {
        driverId: parseInt(driverId),
        NOT: { id: id }  // Exclude the current vehicle being updated
      }
    });
    if (existingAssignment) {
      throw new Error(`Agent "${driver.name}" is already assigned to vehicle ${existingAssignment.id}. Each agent can only be assigned to one vehicle.`);
    }
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      vehicleType,
      capacity,
      status,
      location,
      fuelLevel: fuelLevel !== undefined ? parseInt(fuelLevel) : undefined,
      driverId: driverId ? parseInt(driverId) : null
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      },
      loads: true
    }
  });

  return updatedVehicle;
};

// Delete vehicle
export const deleteVehicle = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new Error("Vehicle not found");

  // Delete vehicle (loads will be cascade deleted)
  await prisma.vehicle.delete({
    where: { id }
  });

  return { message: "Vehicle deleted successfully" };
};

// Add load to vehicle
export const addVehicleLoad = async (vehicleId, { item, quantity }) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new Error("Vehicle not found");

  // Extract quantity number from the quantity string (e.g., "100 Bottles" -> 100)
  const quantityMatch = quantity.match(/^(\d+)/);
  const quantityNumber = quantityMatch ? parseInt(quantityMatch[1]) : 0;

  // Find the inventory item by name
  const inventoryItem = await prisma.inventory.findFirst({
    where: {
      name: {
        equals: item,
        mode: 'insensitive'
      }
    }
  });

  if (inventoryItem) {
    // Check if there's enough stock
    if (inventoryItem.stock < quantityNumber) {
      throw new Error(`Insufficient stock. Available: ${inventoryItem.stock} ${inventoryItem.unit}`);
    }

    // Reduce stock from inventory
    const newStock = inventoryItem.stock - quantityNumber;
    let status = 'In Stock';
    if (newStock === 0) {
      status = 'Out of Stock';
    } else if (newStock < 10) {
      status = 'Low Stock';
    }

    await prisma.inventory.update({
      where: { id: inventoryItem.id },
      data: {
        stock: newStock,
        status
      }
    });
  }

  const load = await prisma.vehicleLoad.create({
    data: {
      vehicleId,
      item,
      quantity
    }
  });

  return load;
};

// Remove load from vehicle
export const removeVehicleLoad = async (loadId) => {
  const load = await prisma.vehicleLoad.findUnique({ where: { id: parseInt(loadId) } });
  if (!load) throw new Error("Load not found");

  // Extract quantity number from the quantity string (e.g., "100 Bottles" -> 100)
  const quantityMatch = load.quantity.match(/^(\d+)/);
  const quantityNumber = quantityMatch ? parseInt(quantityMatch[1]) : 0;

  // Find the inventory item by name and restore stock
  const inventoryItem = await prisma.inventory.findFirst({
    where: {
      name: {
        equals: load.item,
        mode: 'insensitive'
      }
    }
  });

  if (inventoryItem && quantityNumber > 0) {
    // Add stock back to inventory
    const newStock = inventoryItem.stock + quantityNumber;
    let status = 'In Stock';
    if (newStock === 0) {
      status = 'Out of Stock';
    } else if (newStock < 10) {
      status = 'Low Stock';
    }

    await prisma.inventory.update({
      where: { id: inventoryItem.id },
      data: {
        stock: newStock,
        status
      }
    });
  }

  await prisma.vehicleLoad.delete({
    where: { id: parseInt(loadId) }
  });

  return { message: "Load removed successfully" };
};

// Get vehicle loads
export const getVehicleLoads = async (vehicleId) => {
  const loads = await prisma.vehicleLoad.findMany({
    where: { vehicleId },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return loads;
};

// Update vehicle load quantity (without affecting inventory - for distribution tracking)
export const updateVehicleLoad = async (loadId, { quantity, saleData }, userId) => {
  return prisma.$transaction(async (tx) => {
    const load = await tx.vehicleLoad.findUnique({
      where: { id: parseInt(loadId) }
    });
    if (!load) throw new Error("Load not found");

    const parseQuantity = (value) => {
      const match = String(value ?? '').match(/^\s*(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : NaN;
    };
    const currentQuantity = parseQuantity(load.quantity);
    const remainingQuantity = parseQuantity(quantity);
    if (!Number.isFinite(remainingQuantity) || remainingQuantity < 0) {
      throw new Error('Remaining quantity must be a valid non-negative number');
    }
    if (remainingQuantity > currentQuantity) {
      throw new Error('Remaining quantity cannot exceed the current vehicle inventory');
    }

    const assignedDeliveries = await tx.deliveryAssignment.findMany({
      where: {
        vehicleId: load.vehicleId,
        productName: { equals: load.item, mode: 'insensitive' },
        status: { in: ['Pending', 'In Transit'] }
      },
      select: { quantity: true }
    });
    const reservedQuantity = assignedDeliveries.reduce(
      (total, delivery) => total + (parseQuantity(delivery.quantity) || 0),
      0
    );
    if (remainingQuantity < reservedQuantity) {
      throw new Error(
        `Cannot sell assigned stock. Keep at least ${reservedQuantity} units for pending or in-transit deliveries.`
      );
    }

    if (saleData && saleData.customerId && saleData.cashAmount) {
      const distributedQuantity = currentQuantity - remainingQuantity;
      if (distributedQuantity <= 0) {
        throw new Error('Sale quantity must be greater than zero');
      }
      const saleAmount = parseFloat(saleData.cashAmount);
      if (!Number.isFinite(saleAmount) || saleAmount <= 0) {
        throw new Error('Sale amount must be greater than zero');
      }

      const now = new Date();
      const customer = await tx.customer.findUnique({
        where: { id: parseInt(saleData.customerId) }
      });
      const agent = userId
        ? await tx.user.findUnique({ where: { id: parseInt(userId) } })
        : null;
      const unitText = saleData.unit || 'units';
      const itemName = load.item || 'Product';

      await tx.income.create({
        data: {
          type: 'Sales',
          category: 'Product Sales',
          amount: saleAmount,
          description: `Sale of ${distributedQuantity} ${unitText} of ${itemName} to customer`,
          customerId: parseInt(saleData.customerId),
          agentId: userId ? parseInt(userId) : null,
          paymentMethod: saleData.paymentMethod || 'Cash',
          date: now,
          createdAt: now,
          updatedAt: now
        }
      });

      const customerName = customer
        ? customer.shopName || customer.ownerName
        : 'Customer';
      await tx.recentTransaction.create({
        data: {
          type: 'Sale',
          productName: itemName,
          quantity: `${distributedQuantity} ${unitText}`,
          amount: saleAmount,
          customerId: parseInt(saleData.customerId),
          customerName,
          agentId: userId ? parseInt(userId) : null,
          agentName: agent?.name || 'Agent',
          status: 'Completed',
          description: `Direct Vehicle Sale of ${distributedQuantity} ${unitText}`,
          paymentMethod: saleData.paymentMethod || 'Cash',
          createdAt: now,
          updatedAt: now
        }
      });
    }

    const unit = String(load.quantity)
      .replace(/^\s*\d+(?:\.\d+)?\s*/, '')
      .trim();
    return tx.vehicleLoad.update({
      where: { id: parseInt(loadId) },
      data: {
        quantity: unit
          ? `${remainingQuantity} ${unit}`
          : remainingQuantity.toString()
      }
    });
  });
};
