export interface BlogInput {
  title: string;
  category: string;
  content: string;
}

export interface Blog {
  id: string;
  title: string;
  category: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BlogResponse {
  success: boolean;
  message: string;
  data: Blog;
}

export interface BlogsResponse {
  success: boolean;
  data: Blog[];
}
