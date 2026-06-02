import { Router } from "express";
import {
  addBlog,
  fetchAllBlogs,
  fetchBlogById,
  fetchMyBlogs,
  deleteBlog,
  updateBlog,
} from "../controllers/blogController";
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/create", protect, upload.single("thumbnail"), addBlog);
router.get("/all", fetchAllBlogs);
router.get("/myblogs", protect, fetchMyBlogs);
router.get("/:id", fetchBlogById);
router.delete("/:id", protect, deleteBlog);
router.put("/:id", protect, updateBlog);

export default router;
