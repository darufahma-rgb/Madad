import { marked } from 'marked';
import { useMemo } from 'react';

const renderer = new marked.Renderer();

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
  pedantic: false,
});

export default function MarkdownArab({ content, style = {}, ltr = false }) {
  const html = useMemo(() => {
    if (!content) return '';
    try {
      return marked.parse(content);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className="markdown-arab"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        direction: ltr ? 'ltr' : 'rtl',
        textAlign: ltr ? 'left' : 'right',
        lineHeight: 2,
        fontSize: 15,
        color: '#ddd',
        fontFamily: ltr ? 'inherit' : 'serif',
        ...style,
      }}
    />
  );
}
