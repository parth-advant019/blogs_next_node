import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/prisma";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use("/api/v1/auth", authRoutes);

prisma
  .$connect()
  .then(() => console.log("Prisma connected to database"))
  .catch((err: Error) => console.error("Prisma connection error:", err));

app.get("/", (req, res) => {
  res.json({ message: "Blog API is running" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on : ${PORT}`);
});
