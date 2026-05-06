import { Router } from "express";
import {
  addBlog,
  fetchAllBlogs,
  fetchBlogById,
  fetchMyBlogs,
  deleteBlog,
} from "../controllers/blogController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", protect, addBlog);
router.get("/all", fetchAllBlogs);
router.get("/myblogs", protect, fetchMyBlogs);
router.get("/:id", fetchBlogById);
router.delete("/:id", protect, deleteBlog);

export default router;
