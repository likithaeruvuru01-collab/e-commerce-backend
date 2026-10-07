const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getProductsByCategory
} = require("../controllers/categorycontroller");

const router = express.Router();

router.post("/create", createCategory);
router.get("/list", getCategories);
router.get("/:id/products", getProductsByCategory);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;