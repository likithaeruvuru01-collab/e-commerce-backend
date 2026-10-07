require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./routes/userroutes");
const orderRoutes = require("./routes/orderroutes");
const productRoutes = require("./routes/productroutes");
const cartRoutes = require("./routes/cartroutes");
const categoryRoutes = require("./routes/categoryroutes");

app.use("/user", userRoutes);
app.use("/api/users", userRoutes);
app.use("/order", orderRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/category", categoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});