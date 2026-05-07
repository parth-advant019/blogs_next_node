"use client";
import { use } from "react";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AxiosError } from "axios";

import { getBlogById, updateBlog } from "@/services/apiBlog";

import { createBlogSchema } from "@/schemas/blogSchema";

type Props = {
  params: {
    id: string;
  };
};

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const queryClient = useQueryClient();

  const [errors, setErrors] = useState({
    title: "",
    category: "",
    content: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog", id],

    queryFn: () => getBlogById(id),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: updateBlog,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["blogs"],
      });

      queryClient.invalidateQueries({
        queryKey: ["myblogs"],
      });

      queryClient.invalidateQueries({
        queryKey: ["blog", id],
      });

      router.push(`/blogs/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const data = Object.fromEntries(formData.entries()) as {
      title: string;
      category: string;
      content: string;
    };

    const result = createBlogSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        title: fieldErrors.title?.[0] || "",
        category: fieldErrors.category?.[0] || "",
        content: fieldErrors.content?.[0] || "",
      });

      return;
    }

    mutate({
      id: id,
      data: result.data,
    });
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError || !data) {
    return <p className="text-red-500">Failed to load blog</p>;
  }

  const blog = data.data;

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-center text-gray-700">
          Edit Blog
        </h2>

        {error && (
          <p className="text-red-500 text-sm">
            {(
              error as AxiosError<{
                message: string;
              }>
            )?.response?.data?.message || "Failed to update blog"}
          </p>
        )}

        <input
          name="title"
          defaultValue={blog.title}
          placeholder="Title"
          className="w-full border p-2 rounded-md text-gray-900"
        />

        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}

        <select
          name="category"
          defaultValue={blog.category}
          className="w-full border p-2 rounded-md text-gray-900"
        >
          <option value="">Select Category</option>

          <option value="tech">Tech</option>

          <option value="health">Health</option>

          <option value="finance">Finance</option>

          <option value="education">Education</option>
        </select>

        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category}</p>
        )}

        <textarea
          name="content"
          defaultValue={blog.content}
          rows={5}
          placeholder="Write your blog..."
          className="w-full border p-2 rounded-md text-gray-900"
        />

        {errors.content && (
          <p className="text-red-500 text-xs mt-1">{errors.content}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 text-white py-2 rounded-md"
        >
          {isPending ? "Updating..." : "Update Blog"}
        </button>
      </form>
    </div>
  );
}
