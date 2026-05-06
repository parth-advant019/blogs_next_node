import prisma from "../../config/prisma";

export const createBlog = async (data: {
  title: string;
  category: string;
  content: string;
  userId: string;
}) => {
  return prisma.blog.create({
    data: {
      title: data.title,
      category: data.category,
      content: data.content,
      userId: data.userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getAllBlogs = async () => {
  return prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getBlogById = async (id: string) => {
  return prisma.blog.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getBlogsByUserId = async (userId: string) => {
  return prisma.blog.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const deleteBlogById = async (id: string) => {
  return prisma.blog.delete({
    where: {
      id,
    },
  });
};
