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
