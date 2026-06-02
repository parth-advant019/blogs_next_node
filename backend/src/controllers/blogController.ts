import { Request, Response } from "express";
import { createBlogSchema } from "../schemas/blogSchema";
import {
  createBlog,
  deleteBlogById,
  getAllBlogs,
  getBlogById,
  getBlogsByUserId,
  updateBlogById,
} from "../services/repositories/blogRepository";
import { supabase } from "../config/supabase";
import { success } from "zod";

export const addBlog = async (req: Request, res: Response) => {
  try {
    const result = createBlogSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { title, category, content } = result.data;

    //get userId by JWT  by auth middleware
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // file uploads start .........
    let thumbnailUrl: string | undefined;

    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("blog-thumbnails")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }

      const { data } = supabase.storage
        .from("blog-thumbnails")
        .getPublicUrl(fileName);

      thumbnailUrl = data.publicUrl;
    }

    // file uploads end   .........

    const blog = await createBlog({
      title,
      category,
      content,
      userId,
      thumbnailUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Create blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const fetchAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await getAllBlogs();
    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const fetchBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const blog = await getBlogById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const fetchMyBlogs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const blogs = await getBlogsByUserId(userId);

    return res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const userId = (req as any).user?.userId;

    const blog = await getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (blog.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await deleteBlogById(id);

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const result = createBlogSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }
    const userId = (req as any).user?.userId;

    const blog = await getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (blog.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updatedBlog = await updateBlogById(id, result.data);

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
