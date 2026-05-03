// Express app configuration
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enable CORS with configuration
app.use(cors({
  origin: '*', // Allow all origins for development (mobile apps, web, etc.)
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AquaTrack Backend API is running",
    timestamp: new Date().toISOString()
  });
});

// Root API endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working."
  });
});

app.get("/api/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working."
  });
});

export default app;
