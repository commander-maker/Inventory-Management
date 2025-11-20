// Express app configuration
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import authRoutes from "./routes/auth.routes.js";
app.use("/api/auth", authRoutes);

export default app;
