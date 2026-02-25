// Finance route definitions
import express from "express";
import {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
    getAllIncome
} from "../controllers/finance.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Summary (must be before /:id)
router.get("/summary", getExpenseSummary);

// Income
router.get("/income", getAllIncome);

// Expenses CRUD
router.get("/expenses", getAllExpenses);
router.get("/expenses/:id", getExpenseById);
router.post("/expenses", authorize(['admin']), createExpense);
router.put("/expenses/:id", authorize(['admin']), updateExpense);
router.delete("/expenses/:id", authorize(['admin']), deleteExpense);

export default router;
