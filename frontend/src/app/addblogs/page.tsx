"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { createBlog } from "@/services/apiBlog";
import { createBlogSchema } from "@/schemas/blogSchema";
export default function AddBlogPage() {
  const router = useRouter();

  const [errors, setErrors] = useState({
    title: "",
    category: "",
    content: "",
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      router.push("/");
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
    mutate(result.data);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-center text-gray-700">
          Add Blog
        </h2>

        {isError && (
          <p className="text-red-500 text-sm">
            {(error as AxiosError<{ message: string }>)?.response?.data
              ?.message || "Failed to create blog"}
          </p>
        )}

        <input
          name="title"
          placeholder="Title"
          className="w-full border p-2 rounded-md text-gray-900"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}

        <select
          name="category"
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
          placeholder="Write your blog..."
          rows={5}
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
          {isPending ? "Creating..." : "Create Blog"}
        </button>
      </form>
    </div>
  );
}
