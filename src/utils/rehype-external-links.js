/**
 * Rehype plugin to add target="_blank" and rel="noopener noreferrer" to external links
 * This ensures all links in MDX/Markdown content open in new tabs
 */
import { visit } from 'unist-util-visit';

export function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties?.href) {
        const href = node.properties.href;
        
        // Add target="_blank" and rel="noopener noreferrer" to all links
        // (including relative links - if you want only external, check href.startsWith('http'))
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      }
    });
  };
}
