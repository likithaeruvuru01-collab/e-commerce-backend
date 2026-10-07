const mongoose = require("mongoose");
const Category = require("../model/category");
const Product = require("../model/product");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Category name is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        status: false,
        message: "Status is required"
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Status must be active or inactive"
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim()
    });

    if (existingCategory) {
      return res.status(400).json({
        status: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      status
    });

    return res.status(201).json({
      status: true,
      message: "Category created successfully",
      data: category
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      if (!["active", "inactive"].includes(req.query.status)) {
        return res.status(400).json({
          status: false,
          message: "Status must be active or inactive"
        });
      }

      filter.status = req.query.status;
    }

    const categories = await Category.find(filter).sort({
      createdAt: -1
    });

    return res.status(200).json({
      status: true,
      data: categories
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


// GET CATEGORY BY ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: false,
        message: "Category not found"
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      status: true,
      data: category
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: false,
        message: "Category not found"
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found"
      });
    }

    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Category name is required"
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

    if (name !== undefined) {
      const duplicate = await Category.findOne({
        name: name.trim(),
        _id: { $ne: id }
      });

      if (duplicate) {
        return res.status(400).json({
          status: false,
          message: "Category already exists"
        });
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (status !== undefined) {
      category.status = status;
    }

    await category.save();

    return res.status(200).json({
      status: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: false,
        message: "Category not found"
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found"
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


// GET PRODUCTS BY CATEGORY
const getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: false,
        message: "Category not found"
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found"
      });
    }

    const products = await Product.find({
      categoryId: id
    });

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


module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getProductsByCategory
};
