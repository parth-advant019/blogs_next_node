import { Router } from "express";
import { addBlog } from "../controllers/blogController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", protect, addBlog);

export default router;
