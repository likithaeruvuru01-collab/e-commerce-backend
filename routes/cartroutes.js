const express = require("express");

const {
  addToCart,
  getUserCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
  updateCartQuantityByUserAndProduct,
  removeCartItemByUserAndProduct
} = require("../controllers/cartcontroller");

const router = express.Router();

router.post("/add", addToCart);
router.get("/:userId", getUserCart);
router.put("/:userId/:productId", updateCartQuantityByUserAndProduct);
router.delete("/:userId/:productId", removeCartItemByUserAndProduct);
router.put("/:id", updateCartQuantity);
router.delete("/:id", removeCartItem);
router.delete("/user/:userId", clearCart);

module.exports = router;