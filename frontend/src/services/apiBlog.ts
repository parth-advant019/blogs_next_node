import api from "@/lib/axios";
import { BlogInput, BlogResponse } from "@/types/blogTypes";

export const createBlog = async (data: BlogInput): Promise<BlogResponse> => {
  const response = await api.post<BlogResponse>("/blog/create", data);
  return response.data;
};
