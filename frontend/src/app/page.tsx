import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import BlogList from "@/components/blogs/BlogsList";
import { getAllBlogs } from "@/services/apiBlog";

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["blogs"],
    queryFn: getAllBlogs,
  });

  return (
    //dehydrate converts queryClient into plain JSON object for browser
    //HydrationBoundary sends server-fetched data to client component
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogList />
    </HydrationBoundary>
  );
}
