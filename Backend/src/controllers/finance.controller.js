// Logic for finance routes
import * as FinanceService from "../services/finance.service.js";

// Get all expenses
export const getAllExpenses = async (req, res) => {
    try {
        const filters = {
            type: req.query.type,
            category: req.query.category,
            month: req.query.month ? parseInt(req.query.month) : undefined,
            year: req.query.year ? parseInt(req.query.year) : undefined
        };
        const expenses = await FinanceService.getAllExpenses(filters);
        res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
    try {
        const expense = await FinanceService.getExpenseById(req.params.id);
        res.status(200).json({ success: true, data: expense });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// Create expense
export const createExpense = async (req, res) => {
    try {
        const expense = await FinanceService.createExpense(req.body, req.user.id);
        res.status(201).json({
            success: true,
            message: "Expense created successfully",
            data: expense
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update expense
export const updateExpense = async (req, res) => {
    try {
        const expense = await FinanceService.updateExpense(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            data: expense
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const result = await FinanceService.deleteExpense(req.params.id);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get expense summary
export const getExpenseSummary = async (req, res) => {
    try {
        const filters = {
            month: req.query.month ? parseInt(req.query.month) : undefined,
            year: req.query.year ? parseInt(req.query.year) : undefined
        };
        const summary = await FinanceService.getExpenseSummary(filters);
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all income
export const getAllIncome = async (req, res) => {
    try {
        const filters = {
            type: req.query.type,
            category: req.query.category,
            month: req.query.month ? parseInt(req.query.month) : undefined,
            year: req.query.year ? parseInt(req.query.year) : undefined
        };
        const income = await FinanceService.getAllIncome(filters);
        res.status(200).json({ success: true, data: income });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create income
export const createIncome = async (req, res) => {
    try {
        const income = await FinanceService.createIncome(req.body, req.user.id);
        res.status(201).json({
            success: true,
            message: "Income recorded successfully",
            data: income
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
