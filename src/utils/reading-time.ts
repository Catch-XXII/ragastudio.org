/**
 * Calculate estimated reading time from raw text content.
 * Strips MDX/markdown syntax before counting words.
 */
export function getReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/import\s+.*?;\n/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[#*_\[\]()>`~|]/g, "");
  const words = cleaned.split(/\s+/).filter((w) => w.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min read`;
}
