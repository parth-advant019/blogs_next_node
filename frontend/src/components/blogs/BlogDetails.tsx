"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getBlogById } from "@/services/apiBlog";
import { deleteBlog } from "@/services/apiBlog";
import { useRouter } from "next/navigation";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

type Props = {
  id: string;
};

export default function BlogDetails({ id }: Props) {
  // console.log("SSR: fetching blog", id);
  // console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

  const { user, isReady } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["myblogs"] });
      router.push("/");
    },
  });

  if (isLoading) {
    return <p>Loading blog...</p>;
  }

  if (isError || !data) {
    return <p className="text-red-500">Failed to load blog</p>;
  }

  const blog = data.data;

  if (!isReady) {
    return <p>Loading...</p>;
  }

  const isOwner = user?.id === blog.user.id;

  return (
    <div className="mx-auto bg-white rounded-xl shadow-md p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
          {blog.category}
        </span>

        <span className="text-gray-400 text-sm">
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date(blog.createdAt))}
        </span>
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mb-4">{blog.title}</h1>

      <p className="text-gray-500 mb-8">By {blog.user.name}</p>

      {blog.thumbnailUrl && (
        <div className="w-full h-72 relative mb-6">
          <Image
            src={blog.thumbnailUrl}
            alt={blog.title}
            fill
            className="object-contain rounded-lg"
          />
        </div>
      )}
      <div className="text-gray-700 leading-8 mb-4">{blog.content}</div>
      {isOwner && (
        <div className="space-x-2">
          <button
            onClick={() => deleteMutation.mutate(blog.id)}
            className="bg-blue-400 text-white px-4 py-2 rounded mb-6"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Blog"}
          </button>
          <Link href={`/editblog/${blog.id}`}>
            <button className="bg-blue-400 text-white px-4 py-2 rounded mr-3">
              Edit Blog
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
