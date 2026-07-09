import HomeClient from "@/components/marketing/HomeClient";
import { getPublishedPosts } from "@/lib/supabase/blog";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPublishedPosts();
  return <HomeClient posts={posts.slice(0, 3)} />;
}
