import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";

import { formatBlogPublishedDate } from "../service";
import type { BlogListingItem } from "../types";

type BlogPostCardProps = {
  post: BlogListingItem;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Card className="overflow-hidden">
      <Image
        src={post.coverImage.src}
        alt={post.coverImage.alt}
        width={post.coverImage.width}
        height={post.coverImage.height}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="bg-muted h-48 w-full object-cover"
      />

      <CardHeader>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Published {formatBlogPublishedDate(post.publishedAt)}
        </p>
        <CardTitle className="text-xl">
          <Link href={routes.storefront.blogPost(post.slug)} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription>{post.excerpt}</CardDescription>
      </CardHeader>

      <CardContent>
        <Link
          href={routes.storefront.blogPost(post.slug)}
          className="text-primary text-sm font-semibold hover:underline"
          aria-label={`Read article: ${post.title}`}
        >
          Read article
        </Link>
      </CardContent>
    </Card>
  );
}
