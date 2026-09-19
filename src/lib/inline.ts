// Markdown-lite for block text fields: **bold**, *em*, [label](href). Escapes everything else.
export function inline(s: string): string {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\(((?:https?:\/\/|tel:|mailto:)[^\s)]+|\/[^\s)]*|#[^\s)]*)\)/g, '<a href="$2">$1</a>');
}
