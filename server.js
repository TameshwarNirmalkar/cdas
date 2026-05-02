import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import documentRoutes from "./src/routes/documentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import authMiddleware from "./src/middleware/authMiddleware.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected."))
.catch(err => console.log("MongoDB connection error:", err));


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/documents", authMiddleware, documentRoutes);
// app.use("/api/v1/users", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port https://localhost:${process.env.PORT}/api/v1`);
});
