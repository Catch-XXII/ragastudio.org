export const categories = [
  { id: 'literature', label: 'Literature', emoji: '📚', description: 'Books, authors, and the written word.' },
  { id: 'programming', label: 'Programming', emoji: '💻', description: 'Code, tools, and the craft of software.' },
  { id: 'ai', label: 'AI', emoji: '🤖', description: 'Machine learning, models, and the future.' },
  { id: 'chess', label: 'Chess', emoji: '♟️', description: 'Strategy, games, and 64 squares.' },
  { id: 'contemporary', label: 'Contemporary', emoji: '📰', description: 'Current events and modern life.' },
  { id: 'videos', label: 'Short Videos', emoji: '🎬', description: 'Visual stories and embedded media.' },
];

export type Category = typeof categories[number];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}
