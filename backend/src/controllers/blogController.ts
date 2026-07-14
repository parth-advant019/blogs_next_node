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
//import { supabase } from "../config/supabase";
import {
  garageClient,
  GARAGE_BUCKET,
  GARAGE_PUBLIC_URL,
} from "../config/garage";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
//import { success } from "zod";

const API_PUBLIC_URL =
  process.env.API_PUBLIC_URL || "http://localhost:5000";

function blogImageUrl(fileName: string): string {
  return `${API_PUBLIC_URL}/api/v1/blog/images/${fileName}`;
}

function blogImageKeyFromUrl(url: string): string {
  return url.replace(`${API_PUBLIC_URL}/api/v1/blog/images/`, "");
}

import { GetObjectCommand } from "@aws-sdk/client-s3";

export const getImage = async (req: Request, res: Response) => {
  try {
    const key = Array.isArray(req.params.key)
      ? req.params.key.join("/")
      : req.params.key;

    const command = new GetObjectCommand({
      Bucket: GARAGE_BUCKET,
      Key: key,
    });

    const response = await garageClient.send(command);

    res.setHeader("Content-Type", response.ContentType || "image/jpeg");
    // @ts-ignore - Body is a readable stream
    response.Body.pipe(res);
  } catch (error) {
    res.status(404).json({ success: false, message: "Image not found" });
  }
};

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

      try {
        await garageClient.send(
          new PutObjectCommand({
            Bucket: GARAGE_BUCKET,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }

      // thumbnailUrl = `${GARAGE_PUBLIC_URL}/${fileName}`;
      thumbnailUrl = blogImageUrl(fileName);
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

    // if (blog.thumbnailUrl) {
    //   const urlParts = blog.thumbnailUrl.split("/blog-thumbnails/");
    //   const filePath = urlParts[1]; // → "userId/timestamp.png"

    //   if (filePath) {
    //     await supabase.storage.from("blog-thumbnails").remove([filePath]);
    //   }
    // }

    if (blog.thumbnailUrl) {
      //const filePath = blog.thumbnailUrl.replace(`${GARAGE_PUBLIC_URL}/`, "");
      const filePath = blogImageKeyFromUrl(blog.thumbnailUrl);
      if (filePath) {
        try {
          await garageClient.send(
            new DeleteObjectCommand({ Bucket: GARAGE_BUCKET, Key: filePath }),
          );
        } catch (error) {
          console.error("Failed to delete old image:", error);
        }
      }
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

    //file upload start ....
    let thumbnailUrl: string | undefined = undefined;

    // if (req.file) {
    //   if (blog.thumbnailUrl) {
    //     const urlParts = blog.thumbnailUrl.split("/blog-thumbnails/");
    //     const oldFilePath = urlParts[1];

    //     if (oldFilePath) {
    //       await supabase.storage.from("blog-thumbnails").remove([oldFilePath]);
    //     }
    //   }

    //   // user upload image
    //   const file = req.file;
    //   const fileExt = file.originalname.split(".").pop();
    //   const fileName = `${userId}/${Date.now()}.${fileExt}`;

    //   const { error } = await supabase.storage
    //     .from("blog-thumbnails")
    //     .upload(fileName, file.buffer, {
    //       contentType: file.mimetype,
    //       upsert: false,
    //     });

    //   if (error) {
    //     return res
    //       .status(500)
    //       .json({ success: false, message: "Image upload failed" });
    //   }

    //   const { data } = supabase.storage
    //     .from("blog-thumbnails")
    //     .getPublicUrl(fileName);

    //   thumbnailUrl = data.publicUrl;

    //   //file upload end ....
    // }

    if (req.file) {
      if (blog.thumbnailUrl) {
        // const oldFilePath = blog.thumbnailUrl.replace(
        //   `${GARAGE_PUBLIC_URL}/`,
        //   "",
        // );

        const oldFilePath = blogImageKeyFromUrl(blog.thumbnailUrl);

        if (oldFilePath) {
          try {
            await garageClient.send(
              new DeleteObjectCommand({
                Bucket: GARAGE_BUCKET,
                Key: oldFilePath,
              }),
            );
          } catch (error) {
            console.error("Failed to delete old image:", error);
          }
        }
      }

      // user upload image
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      try {
        await garageClient.send(
          new PutObjectCommand({
            Bucket: GARAGE_BUCKET,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }

      //thumbnailUrl = `${GARAGE_PUBLIC_URL}/${fileName}`;

      thumbnailUrl = blogImageUrl(fileName);

      //file upload end ....
    }

    const updatedBlog = await updateBlogById(id, {
      ...result.data,
      thumbnailUrl,
    });
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
