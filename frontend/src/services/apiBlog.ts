import api from "@/lib/axios";
import { BlogInput, BlogResponse, BlogsResponse } from "@/types/blogTypes";
import { string } from "zod";

export const createBlog = async (formData: FormData): Promise<BlogResponse> => {
  const response = await api.post<BlogResponse>("/blog/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getAllBlogs = async (): Promise<BlogsResponse> => {
  const response = await api.get<BlogsResponse>("/blog/all");
  return response.data;
};
export const getBlogById = async (id: string): Promise<BlogResponse> => {
  const response = await api.get<BlogResponse>(`/blog/${id}`);
  return response.data;
};

export const getMyBlogs = async (): Promise<BlogsResponse> => {
  const response = await api.get<BlogsResponse>("/blog/myblogs");

  return response.data;
};

export const deleteBlog = async (id: string) => {
  const response = await api.delete(`/blog/${id}`);
  return response.data;
};

export const updateBlog = async ({
  id,
  data,
}: {
  id: string;
  data: BlogInput;
}): Promise<BlogResponse> => {
  const response = await api.put(`/blog/${id}`, data);
  return response.data;
};
