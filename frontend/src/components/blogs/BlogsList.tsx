"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getAllBlogs } from "@/services/apiBlog";

export default function BlogList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogs"],
    queryFn: getAllBlogs,
  });

  if (isLoading) {
    return <p>Loading..</p>;
  }

  if (isError) {
    return <p>Error loading blogs</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.data.map((blog) => (
        <Link key={blog.id} href={`/blogs/${blog.id}`}>
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-600">{blog.title}</h2>

            <p className="text-sm text-blue-500 mt-2">{blog.category}</p>

            <p className="text-gray-600 mt-3 line-clamp-2">{blog.content}</p>
            <p className="text-gray-600 mt-3">Author: {blog.user.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
