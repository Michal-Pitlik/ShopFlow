import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getStats,
} from "../controllers/orders.controller";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// All order routes require auth
router.use(authenticate);

// Customer
router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);

// Admin
router.get("/", requireAdmin, getAllOrders);
router.get("/admin/stats", requireAdmin, getStats);
router.patch("/:id/status", requireAdmin, updateOrderStatus);

export default router;
