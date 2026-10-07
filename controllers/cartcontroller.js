const mongoose = require("mongoose");
const Cart = require("../model/cart");
const User = require("../model/user");
const Product = require("../model/product");

// ==========================================
// ADD PRODUCT TO CART
// POST /cart/add
// ==========================================
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Required field validation
    if (!userId || !productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, productId and quantity are required"
      });
    }

    // ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or productId"
      });
    }

    // Quantity validation
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });
    }

    // Check user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check active product
    if (product.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Inactive product cannot be added to cart"
      });
    }

    // Check stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units are available`
      });
    }

    // Check duplicate cart item
    const existingCartItem = await Cart.findOne({
      userId,
      productId
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      // Check total quantity against stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. You already have ${existingCartItem.quantity} in cart and only ${product.stock} are available`
        });
      }

      existingCartItem.quantity = newQuantity;

      // Store current product price
      existingCartItem.price = product.price;

      await existingCartItem.save();

      return res.status(200).json({
        success: true,
        message: "Product quantity updated in cart",
        cartItem: existingCartItem
      });
    }

    // Create new cart item
    const cartItem = await Cart.create({
      userId,
      productId,
      quantity,
      price: product.price
    });

    return res.status(201).json({
      success: true,
      message: "Product added to cart",
      cartItem
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
      error: error.message
    });
  }
};

// ==========================================
// GET USER CART
// GET /cart/:userId
// ==========================================
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const cartItems = await Cart.find({ userId })
      .populate("productId");

    let grandTotal = 0;

    const items = cartItems.map((item) => {
      const itemTotal = item.price * item.quantity;

      grandTotal += itemTotal;

      return {
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        itemTotal
      };
    });

    return res.status(200).json({
      success: true,
      userId,
      itemCount: items.length,
      items,
      grandTotal
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get cart",
      error: error.message
    });
  }
};

// ==========================================
// UPDATE CART QUANTITY
// PUT /cart/:id
// ==========================================
const updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID"
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });
    }

    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    const product = await Product.findById(cartItem.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product no longer exists"
      });
    }

    if (product.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Inactive product cannot be updated in cart"
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units are available`
      });
    }

    cartItem.quantity = quantity;
    cartItem.price = product.price;

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cartItem
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message
    });
  }
};

// ==========================================
// REMOVE CART ITEM
// DELETE /cart/:id
// ==========================================
const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID"
      });
    }

    const cartItem = await Cart.findByIdAndDelete(id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
      error: error.message
    });
  }
};

// ==========================================
// CLEAR USER CART
// DELETE /cart/user/:userId
// ==========================================
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const result = await Cart.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message
    });
  }
};

const updateCartQuantityByUserAndProduct = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }
    cartItem.quantity = quantity;
    await cartItem.save();
    return res.status(200).json({ success: true, message: "Cart updated", cartItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeCartItemByUserAndProduct = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cartItem = await Cart.findOneAndDelete({ userId, productId });
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }
    return res.status(200).json({ success: true, message: "Cart item removed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addToCart,
  getUserCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
  updateCartQuantityByUserAndProduct,
  removeCartItemByUserAndProduct
};
