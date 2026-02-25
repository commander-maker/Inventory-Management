// Business logic for finance
import prisma from "../config/db.js";

// ─── EXPENSES ───

// Get all expenses with optional filters
export const getAllExpenses = async (filters = {}) => {
    const where = {};

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;

    if (filters.month && filters.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
        where.date = { gte: startDate, lte: endDate };
    } else if (filters.year) {
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59);
        where.date = { gte: startDate, lte: endDate };
    }

    const expenses = await prisma.expense.findMany({
        where,
        include: {
            User_Expense_agentIdToUser: {
                select: { id: true, name: true }
            },
            User_Expense_approvedByToUser: {
                select: { id: true, name: true }
            },
            Vehicle: {
                select: { id: true, vehicleType: true }
            }
        },
        orderBy: { date: 'desc' }
    });

    return expenses;
};

// Get expense by ID
export const getExpenseById = async (id) => {
    const expense = await prisma.expense.findUnique({
        where: { id: parseInt(id) },
        include: {
            User_Expense_agentIdToUser: {
                select: { id: true, name: true }
            },
            User_Expense_approvedByToUser: {
                select: { id: true, name: true }
            },
            Vehicle: {
                select: { id: true, vehicleType: true }
            }
        }
    });

    if (!expense) throw new Error("Expense not found");
    return expense;
};

// Create new expense
export const createExpense = async (data, userId) => {
    const {
        type,
        category,
        amount,
        description,
        vehicleId,
        agentId,
        billNumber,
        date
    } = data;

    const expense = await prisma.expense.create({
        data: {
            type,
            category,
            amount: parseFloat(amount),
            description,
            vehicleId: vehicleId || null,
            agentId: agentId ? parseInt(agentId) : null,
            approvedBy: parseInt(userId),
            billNumber: billNumber || null,
            date: date ? new Date(date) : new Date(),
            updatedAt: new Date()
        },
        include: {
            User_Expense_agentIdToUser: {
                select: { id: true, name: true }
            },
            User_Expense_approvedByToUser: {
                select: { id: true, name: true }
            },
            Vehicle: {
                select: { id: true, vehicleType: true }
            }
        }
    });

    return expense;
};

// Update expense
export const updateExpense = async (id, data) => {
    const updateData = { ...data, updatedAt: new Date() };

    if (updateData.amount) updateData.amount = parseFloat(updateData.amount);
    if (updateData.agentId) updateData.agentId = parseInt(updateData.agentId);
    if (updateData.date) updateData.date = new Date(updateData.date);

    const expense = await prisma.expense.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
            User_Expense_agentIdToUser: {
                select: { id: true, name: true }
            },
            User_Expense_approvedByToUser: {
                select: { id: true, name: true }
            },
            Vehicle: {
                select: { id: true, vehicleType: true }
            }
        }
    });

    return expense;
};

// Delete expense
export const deleteExpense = async (id) => {
    await prisma.expense.delete({
        where: { id: parseInt(id) }
    });
    return { message: "Expense deleted successfully" };
};

// Get expense summary (breakdown by category)
export const getExpenseSummary = async (filters = {}) => {
    const where = {};

    if (filters.month && filters.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
        where.date = { gte: startDate, lte: endDate };
    } else if (filters.year) {
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59);
        where.date = { gte: startDate, lte: endDate };
    }

    const expenses = await prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: { id: true }
    });

    const totalExpenses = await prisma.expense.aggregate({
        where,
        _sum: { amount: true }
    });

    const totalIncome = await prisma.income.aggregate({
        where: where.date ? { date: where.date } : {},
        _sum: { amount: true }
    });

    return {
        breakdown: expenses.map(e => ({
            category: e.category,
            amount: parseFloat(e._sum.amount) || 0,
            count: e._count.id
        })),
        totalExpenses: parseFloat(totalExpenses._sum.amount) || 0,
        totalIncome: parseFloat(totalIncome._sum.amount) || 0,
        netProfit: (parseFloat(totalIncome._sum.amount) || 0) - (parseFloat(totalExpenses._sum.amount) || 0)
    };
};

// ─── INCOME ───

// Get all income records
export const getAllIncome = async (filters = {}) => {
    const where = {};

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;

    if (filters.month && filters.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
        where.date = { gte: startDate, lte: endDate };
    } else if (filters.year) {
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59);
        where.date = { gte: startDate, lte: endDate };
    }

    const income = await prisma.income.findMany({
        where,
        include: {
            User: { select: { id: true, name: true } },
            Customer: { select: { id: true, shopName: true } }
        },
        orderBy: { date: 'desc' }
    });

    return income;
};
