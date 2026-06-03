"use client";
import { use } from "react";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AxiosError } from "axios";

import { getBlogById, updateBlog } from "@/services/apiBlog";

import { createBlogSchema } from "@/schemas/blogSchema";
import Image from "next/image";

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

    const form = e.currentTarget;
    const rawData = Object.fromEntries(new FormData(form).entries()) as {
      title: string;
      category: string;
      content: string;
    };

    const result = createBlogSchema.safeParse(rawData);

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
      data: new FormData(form),
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

        {blog.thumbnailUrl && (
          <div className="w-full h-40 relative mb-6">
            <p className="text-sm text-gray-500">Current thumbnail:</p>
            <Image
              src={blog.thumbnailUrl}
              alt="Current thumbnail"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Thumbnail <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

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
