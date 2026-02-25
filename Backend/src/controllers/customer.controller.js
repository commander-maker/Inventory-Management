import * as CustomerService from "../services/customer.service.js";

// Get all customers
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerService.getAllCustomers();
        res.status(200).json({
            success: true,
            data: customers,
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch customers",
        });
    }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
    try {
        const customer = await CustomerService.getCustomerById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.status(200).json({
            success: true,
            data: customer,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Create new customer
export const createCustomer = async (req, res) => {
    try {
        console.log('Creating customer with data:', req.body);

        // Validate required fields
        const requiredFields = ['shopName', 'ownerName', 'phone', 'address', 'city', 'area'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        const customer = await CustomerService.createCustomer(req.body);

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer,
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create customer",
        });
    }
};

// Update customer
export const updateCustomer = async (req, res) => {
    try {
        const customer = await CustomerService.updateCustomer(req.params.id, req.body);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer,
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
    try {
        await CustomerService.deleteCustomer(req.params.id);

        res.status(200).json({
            success: true,
            message: "Customer deleted successfully",
        });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
