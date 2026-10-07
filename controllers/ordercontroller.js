const Order = require("../model/order");

// ============================
// CREATE ORDER
// ============================
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      deliveryAddress
    } = req.body;

    // Validate user
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required"
      });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Cart is empty"
      });
    }

    // Validate delivery information
    if (
      !deliveryAddress ||
      !deliveryAddress.fullName ||
      !deliveryAddress.phone ||
      !deliveryAddress.address ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.pincode
    ) {
      return res.status(400).json({
        status: false,
        message: "Complete delivery information is required"
      });
    }

    // Create order
    const order = await Order.create({
      userId,
      items,
      totalAmount,
      deliveryAddress,
      status: "Placed"
    });

    return res.status(201).json({
      status: true,
      message: "Order placed successfully",
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        items: order.items
      }
    });

  } catch (error) {
    console.log("Create Order Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while creating order",
      error: error.message
    });
  }
};


// ============================
// GET USER ORDERS
// ============================
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      orders
    });

  } catch (error) {
    console.log("Get Orders Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while getting orders",
      error: error.message
    });
  }
};


// ============================
// GET SINGLE ORDER
// ============================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      status: true,
      order
    });

  } catch (error) {
    console.log("Get Order Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while getting order",
      error: error.message
    });
  }
};


// ============================
// GET ALL ORDERS (ADMIN)
// ============================
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.log("Get All Orders Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error while getting orders",
      error: error.message
    });
  }
};

// ============================
// UPDATE ORDER STATUS (ADMIN)
// ============================
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: false,
        message: "Status is required"
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found"
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      status: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.log("Update Order Status Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error while updating order status",
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};