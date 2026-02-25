// Business logic for customers
import prisma from "../config/db.js";

// Get all customers
export const getAllCustomers = async () => {
    const customers = await prisma.customer.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: {
                    DeliveryAssignment: true,
                    Income: true
                }
            }
        }
    });

    return customers;
};

// Get customer by ID
export const getCustomerById = async (id) => {
    const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
        include: {
            DeliveryAssignment: {
                orderBy: { createdAt: 'desc' },
                take: 10
            },
            Income: {
                orderBy: { date: 'desc' },
                take: 10
            }
        }
    });

    if (!customer) throw new Error("Customer not found");
    return customer;
};

// Create new customer
export const createCustomer = async ({ shopName, ownerName, phone, email, address, city, area, businessType, status, notes, distance }) => {
    // Check if customer with same shop name and phone exists
    const exists = await prisma.customer.findFirst({
        where: {
            shopName: {
                equals: shopName,
                mode: 'insensitive'
            },
            phone: phone
        }
    });

    if (exists) throw new Error("Customer with this shop name and phone already exists");

    const customer = await prisma.customer.create({
        data: {
            shopName,
            ownerName,
            phone,
            email: email || null,
            address,
            city,
            area,
            businessType: businessType || 'Retail',
            status: status || 'Active',
            notes: notes || null,
            distance: distance ? parseFloat(distance) : null,
            updatedAt: new Date()
        }
    });

    return customer;
};

// Update customer
export const updateCustomer = async (id, { shopName, ownerName, phone, email, address, city, area, businessType, status, notes, distance }) => {
    const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) }
    });

    if (!customer) throw new Error("Customer not found");

    const updatedCustomer = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: {
            shopName,
            ownerName,
            phone,
            email: email || null,
            address,
            city,
            area,
            businessType,
            status,
            notes: notes || null,
            distance: distance !== undefined ? (distance ? parseFloat(distance) : null) : undefined,
            updatedAt: new Date()
        }
    });

    return updatedCustomer;
};

// Delete customer
export const deleteCustomer = async (id) => {
    const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) }
    });

    if (!customer) throw new Error("Customer not found");

    await prisma.customer.delete({
        where: { id: parseInt(id) }
    });

    return { message: "Customer deleted successfully" };
};
