/**
 * Shared navigation utilities used by both desktop and mobile navigation
 */
import { getCollection } from "astro:content";
import { categories } from "../config/categories";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  category?: string;
  count?: number;
}

export async function getNavItems(): Promise<NavItem[]> {
  const allPosts = await getCollection("posts", ({ data }) => !data.draft);
  const postCountByCategory = allPosts.reduce(
    (acc, post) => {
      const category = post.data.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/search", label: "Search", icon: "🔍" },
    ...categories.map(cat => ({
      href: `/categories/${cat.id}`,
      label: cat.label,
      icon: cat.emoji,
      category: cat.id,
      count: postCountByCategory[cat.id] || 0,
    })),
  ];

  return navItems;
}

export function formatCount(count: number): string {
  return count > 99 ? "(99+)" : `(${count})`;
}

export function isActive(href: string, path: string): boolean {
  if (href === "/") return path === "/";
  return path.startsWith(href);
}
