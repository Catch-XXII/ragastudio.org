/**
 * Generate a favicon data URI from an emoji character
 * Uses SVG to render the emoji as a square icon
 */
export function getEmojiFavicon(emoji: string): string {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <text x="16" y="26" font-size="24" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    </svg>`
  );
  return `data:image/svg+xml,${encoded}`;
}
