import { Request, Response } from "express";
import { createBlogSchema } from "../schemas/blogSchema";
import { createBlog } from "../services/repositories/blogRepository";

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

    const blog = await createBlog({
      title,
      category,
      content,
      userId,
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
