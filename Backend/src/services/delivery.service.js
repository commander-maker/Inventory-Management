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

  let finalUnitPrice = unitPrice ? parseFloat(unitPrice) : null;
  let finalTotalAmount = totalAmount ? parseFloat(totalAmount) : null;

  if (!finalUnitPrice || !finalTotalAmount) {
    const inv = await prisma.inventory.findFirst({
      where: { name: { equals: productName, mode: 'insensitive' } }
    });
    if (inv && inv.price) {
      finalUnitPrice = finalUnitPrice || parseFloat(inv.price);
      const qty = getLeadingQuantity(quantity) || 1;
      finalTotalAmount = finalTotalAmount || (finalUnitPrice * qty);
    }
  }

  const delivery = await prisma.deliveryAssignment.create({
    data: {
      vehicleId,
      customerId: parseInt(customerId),
      productName,
      quantity,
      unitPrice: finalUnitPrice,
      totalAmount: finalTotalAmount,
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

const getLeadingQuantity = (value) => {
  const match = String(value ?? '').match(/^\s*(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

const updateVehicleLoadForDelivery = async (tx, delivery) => {
  const deliveredQuantity = getLeadingQuantity(delivery.quantity);
  if (deliveredQuantity <= 0) {
    return;
  }

  if (delivery.vehicleId) {
    const load = await tx.vehicleLoad.findFirst({
      where: {
        vehicleId: delivery.vehicleId,
        item: {
          equals: delivery.productName,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (load) {
      const availableQuantity = getLeadingQuantity(load.quantity);
      const remainingQuantity = Math.max(0, availableQuantity - deliveredQuantity);
      const unit = String(load.quantity).replace(/^\s*\d+(?:\.\d+)?\s*/, '').trim();

      await tx.vehicleLoad.update({
        where: { id: load.id },
        data: {
          quantity: unit
            ? `${remainingQuantity} ${unit}`
            : remainingQuantity.toString()
        }
      });
    }
  }

  // Deduct from warehouse Inventory table
  const inventoryItem = await tx.inventory.findFirst({
    where: {
      name: {
        equals: delivery.productName,
        mode: 'insensitive'
      }
    }
  });

  if (inventoryItem) {
    const newStock = Math.max(0, inventoryItem.stock - Math.round(deliveredQuantity));
    let status = 'In Stock';
    if (newStock === 0) status = 'Out of Stock';
    else if (newStock < 10) status = 'Low Stock';

    await tx.inventory.update({
      where: { id: inventoryItem.id },
      data: {
        stock: newStock,
        status,
        updatedAt: new Date()
      }
    });
  }
};

// Update delivery status (agent completing delivery)
export const updateDeliveryStatus = async (id, agentId, data) => {
  const { status, notes } = data;

  const updatedDelivery = await prisma.$transaction(async (tx) => {
    const currentDelivery = await tx.deliveryAssignment.findUnique({
      where: { id: parseInt(id) },
      include: { Customer: true, Vehicle: true }
    });

    if (!currentDelivery) throw new Error('Delivery not found');

    // Completion is idempotent: retrying the mobile request cannot create a second sale.
    if (status === 'Delivered' && currentDelivery.incomeId == null) {
      const now = new Date();
      const quantity = getLeadingQuantity(currentDelivery.quantity) || 1;
      let amount = currentDelivery.totalAmount != null
        ? parseFloat(currentDelivery.totalAmount)
        : (parseFloat(currentDelivery.unitPrice) || 0) * quantity;

      if (amount <= 0) {
        const inv = await tx.inventory.findFirst({
          where: { name: { equals: currentDelivery.productName, mode: 'insensitive' } }
        });
        if (inv && inv.price) {
          amount = parseFloat(inv.price) * quantity;
        }
      }

      await updateVehicleLoadForDelivery(tx, currentDelivery);

      let income = null;
      if (amount > 0) {
        income = await tx.income.create({
          data: {
            type: 'Sales',
            category: 'Product Sales',
            amount,
            description: `Sale of ${currentDelivery.quantity} of ${currentDelivery.productName} to ${currentDelivery.Customer.shopName}`,
            customerId: currentDelivery.customerId,
            agentId: parseInt(agentId),
            paymentMethod: 'Cash',
            date: now,
            createdAt: now,
            updatedAt: now
          }
        });

        const agent = await tx.user.findUnique({
          where: { id: parseInt(agentId) },
          select: { name: true }
        });

        await tx.recentTransaction.create({
          data: {
            type: 'Sale',
            productName: currentDelivery.productName,
            quantity: currentDelivery.quantity,
            amount,
            customerId: currentDelivery.customerId,
            customerName: currentDelivery.Customer.shopName,
            agentId: parseInt(agentId),
            agentName: agent?.name || 'Agent',
            status: 'Completed',
            description: `Delivery sale to ${currentDelivery.Customer.shopName}`,
            paymentMethod: 'Cash',
            createdAt: now,
            updatedAt: now
          }
        });

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyIncome = await tx.income.aggregate({
          where: {
            agentId: parseInt(agentId),
            date: { gte: monthStart }
          },
          _sum: { amount: true }
        });

        await tx.user.update({
          where: { id: parseInt(agentId) },
          data: { monthlySales: monthlyIncome._sum.amount || 0 }
        });
      }

      return tx.deliveryAssignment.update({
        where: { id: parseInt(id) },
        data: {
          status,
          notes: notes || undefined,
          updatedAt: now,
          deliveredAt: now,
          deliveredBy: parseInt(agentId),
          incomeId: income ? income.id : null
        },
        include: {
          Customer: true,
          Vehicle: true,
          User: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      });
    }

    return tx.deliveryAssignment.update({
      where: { id: parseInt(id) },
      data: {
        status,
        notes: notes || undefined,
        updatedAt: new Date(),
        ...(status === 'Delivered'
          ? { deliveredAt: new Date(), deliveredBy: parseInt(agentId) }
          : {})
      },
      include: {
        Customer: true,
        Vehicle: true,
        User: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });
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
