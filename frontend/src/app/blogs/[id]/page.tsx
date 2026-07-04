import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import BlogDetails from "@/components/blogs/BlogDetails";

import { getBlogById } from "@/services/apiBlog";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BlogPage({ params }: Props) {
  const { id } = await params;

  const queryClient = new QueryClient();
  //for check this is server side fetch
  // try {
  //   await queryClient.prefetchQuery({
  //     queryKey: ["blog", id],
  //     queryFn: () => getBlogById(id),
  //   });

  //   // Check what data was actually fetched
  //   const data = queryClient.getQueryData(["blog", id]);
  //   console.log("Prefetched data:", JSON.stringify(data)); // ← add this
  // } catch (err) {
  //   console.log("Prefetch error:", err); // ← add this //
  // }

  await queryClient.prefetchQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogDetails id={id} />
    </HydrationBoundary>
  );
}
