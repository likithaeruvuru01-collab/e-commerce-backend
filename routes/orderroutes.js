const express = require("express");

const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/ordercontroller");


// Create order
router.post("/create", createOrder);

// Get all orders (Admin)
router.get("/all", getAllOrders);

// Get user's orders
router.get("/user/:userId", getUserOrders);

// Get one order
router.get("/:id", getOrderById);

// Update order status (Admin)
router.put("/:id/status", updateOrderStatus);
router.put("/:id", updateOrderStatus);

module.exports = router;