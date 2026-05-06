"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { getMyBlogs } from "@/services/apiBlog";

export default function YourBlogsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["myblogs"],
    queryFn: getMyBlogs,
  });

  if (isLoading) {
    return <p>Loading blogs...</p>;
  }

  if (isError) {
    return <p className="text-red-500">Failed to load blogs</p>;
  }

  if (!data?.data.length) {
    return <p className="text-gray-500">No blogs created yet</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.data.map((blog) => (
        <Link key={blog.id} href={`/blogs/${blog.id}`}>
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-600">{blog.title}</h2>

            <p className="text-sm text-blue-500 mt-2">{blog.category}</p>

            <p className="text-gray-600 mt-3 line-clamp-2">{blog.content}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
