const User = require("../model/user");

// =========================
// REGISTER USER
// =========================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Please provide name, email and password"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists"
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log("Register Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error during registration",
      error: error.message
    });
  }
};


// =========================
// LOGIN USER
// =========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Please provide email and password"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({
        status: false,
        message: "Incorrect password"
      });
    }

    // Login successful
    return res.status(200).json({
      status: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error during login",
      error: error.message
    });
  }
};


// =========================
// EXPORT
// =========================
module.exports = {
  registerUser,
  loginUser
};