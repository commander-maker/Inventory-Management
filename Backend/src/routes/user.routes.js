// User routes
import express from "express";
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  updatePassword,
  uploadAvatar
} from "../controllers/user.controller.js";
import { authenticate, isAdmin, isAdminOrSelf } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Password update route (must come before /:id routes)
router.put("/password/update", updatePassword);

// Avatar upload route
router.post("/avatar/upload", upload.single('avatar'), uploadAvatar);

// User CRUD routes
router.get("/", isAdmin, getAllUsers);
router.get("/:id", isAdminOrSelf, getUserById);
router.post("/", isAdmin, createUser);
router.put("/:id", isAdminOrSelf, updateUser);
router.delete("/:id", isAdmin, deleteUser);

export default router;
