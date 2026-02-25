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
