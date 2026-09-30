// Auth route definitions
import express from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

if (process.env.ALLOW_PUBLIC_REGISTRATION === "true") {
	router.post("/register", register);
}

router.post("/login", login);

export default router;
