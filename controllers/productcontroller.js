const mongoose = require("mongoose");
const Product = require("../model/product");
const Category = require("../model/category");



// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      status,
      categoryId
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Product name is required"
      });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Description is required"
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        status: false,
        message: "Price is required"
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        status: false,
        message: "Price must be greater than 0"
      });
    }

    if (stock === undefined || stock === null || stock === "") {
      return res.status(400).json({
        status: false,
        message: "Stock is required"
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        status: false,
        message: "Stock cannot be negative"
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Status must be active or inactive"
      });
    }

    // Category validation for Assignment 3
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid category ID"
        });
      }

      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found"
        });
      }

      if (category.status !== "active") {
        return res.status(400).json({
          status: false,
          message: "Cannot assign product to inactive category"
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      status,
      categoryId
    });

    return res.status(201).json({
      status: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      data: products
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: false,
        message: "Product not found"
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      status: true,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: false,
        message: "Product not found"
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found"
      });
    }

    const {
      name,
      description,
      price,
      stock,
      status,
      categoryId
    } = req.body;

    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Product name is required"
      });
    }

    if (description !== undefined && description.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Description is required"
      });
    }

    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({
        status: false,
        message: "Price must be greater than 0"
      });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        status: false,
        message: "Stock cannot be negative"
      });
    }

    if (
      status !== undefined &&
      !["active", "inactive"].includes(status)
    ) {
      return res.status(400).json({
        status: false,
        message: "Status must be active or inactive"
      });
    }

    if (categoryId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid category ID"
        });
      }

      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found"
        });
      }

      if (category.status !== "active") {
        return res.status(400).json({
          status: false,
          message: "Cannot assign product to inactive category"
        });
      }
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.status = status ?? product.status;
    product.categoryId = categoryId ?? product.categoryId;

    await product.save();

    return res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: false,
        message: "Product not found"
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found"
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
