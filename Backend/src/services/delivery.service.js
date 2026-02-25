// Delivery service - Business logic for delivery management
import prisma from "../config/db.js";
import * as NotificationService from "./notification.service.js";

// Get all deliveries (admin view)
export const getAllDeliveries = async () => {
  const deliveries = await prisma.deliveryAssignment.findMany({
    include: {
      Customer: true,
      Vehicle: {
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      },
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return deliveries;
};

// Get deliveries for a specific agent
export const getAgentDeliveries = async (agentId) => {
  const deliveries = await prisma.deliveryAssignment.findMany({
    where: {
      Vehicle: {
        driverId: parseInt(agentId)
      }
    },
    include: {
      Customer: true,
      Vehicle: true,
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return deliveries;
};

// Get delivery by ID
export const getDeliveryById = async (id) => {
  const delivery = await prisma.deliveryAssignment.findUnique({
    where: { id: parseInt(id) },
    include: {
      Customer: true,
      Vehicle: true,
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!delivery) throw new Error("Delivery not found");
  return delivery;
};

// Create new delivery assignment
export const createDelivery = async (data) => {
  const { vehicleId, customerId, productName, quantity, unitPrice, totalAmount, notes } = data;

  const delivery = await prisma.deliveryAssignment.create({
    data: {
      vehicleId,
      customerId: parseInt(customerId),
      productName,
      quantity,
      unitPrice: unitPrice ? parseFloat(unitPrice) : null,
      totalAmount: totalAmount ? parseFloat(totalAmount) : null,
      status: "Pending",
      notes
    },
    include: {
      Customer: true,
      Vehicle: true
    }
  });

  // Notify the agent assigned to the vehicle
  if (delivery.Vehicle?.driverId) {
    await NotificationService.createNotification(delivery.Vehicle.driverId, {
      title: "New Delivery Assignment",
      message: `You have been assigned to deliver ${delivery.quantity} of ${delivery.productName} to ${delivery.Customer.shopName}.`,
      type: "info"
    });
  }

  return delivery;
};

// Update delivery status (agent completing delivery)
export const updateDeliveryStatus = async (id, agentId, data) => {
  const { status, notes } = data;

  const updateData = {
    status,
    notes: notes || undefined,
    updatedAt: new Date()
  };

  // If status is Delivered, set deliveredAt and deliveredBy
  if (status === "Delivered") {
    updateData.deliveredAt = new Date();
    updateData.deliveredBy = parseInt(agentId);
  }

  const updatedDelivery = await prisma.deliveryAssignment.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      Customer: true,
      Vehicle: true,
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  // Notify admins about the status update
  await NotificationService.notifyAdmins({
    title: "Delivery Status Updated",
    message: `Delivery #${id} for ${updatedDelivery.Customer.shopName} has been updated to ${status} by ${updatedDelivery.User?.name || 'an agent'}.`,
    type: status === "Delivered" ? "success" : "info"
  });

  return updatedDelivery;
};

// Delete delivery
export const deleteDelivery = async (id) => {
  await prisma.deliveryAssignment.delete({
    where: { id: parseInt(id) }
  });

  return { message: "Delivery deleted successfully" };
};
