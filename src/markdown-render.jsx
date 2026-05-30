/* Talqih, Mini markdown renderer (no dependencies)
   Supports: H1-H3, bold, italic, bullet list, numbered list,
   blockquote, inline code, paragraph, Arabic auto-detect, :bismillah:
*/

const renderMarkdown = (raw) => {
  if (!raw || typeof raw !== "string") return "";

  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const lines = raw.split("\n");
  const html = [];
  let listBuffer = [];
  let listType = null; // "ul" or "ol"

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const tag = listType === "ol" ? "ol" : "ul";
    const cls = listType === "ol"
      ? "list-decimal pl-6 space-y-1 my-3 text-ink-muted leading-relaxed"
      : "list-disc pl-6 space-y-1 my-3 text-ink-muted leading-relaxed";
    html.push(`<${tag} class="${cls}">${listBuffer.join("")}</${tag}>`);
    listBuffer = [];
    listType = null;
  };

  const inline = (text) => {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-ink-muted italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="font-mono text-xs bg-white/8 px-1.5 py-0.5 rounded text-emerald-200">$1</code>');
  };

  const isMostlyArabic = (text) => {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    return arabicChars > text.length * 0.4;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // :bismillah: shortcode
    if (line.trim() === ":bismillah:") {
      flushList();
      html.push(`<div class="text-center my-6"><div class="arabic-display-modern text-gold-300 text-2xl leading-loose" style="direction:rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div></div>`);
      continue;
    }

    // H1
    if (/^# /.test(line)) {
      flushList();
      html.push(`<h1 class="font-display text-3xl font-semibold text-ink mt-8 mb-4 leading-tight">${inline(line.slice(2))}</h1>`);
      continue;
    }

    // H2
    if (/^## /.test(line)) {
      flushList();
      html.push(`<h2 class="font-display text-2xl font-semibold text-ink mt-7 mb-3 leading-tight">${inline(line.slice(3))}</h2>`);
      continue;
    }

    // H3
    if (/^### /.test(line)) {
      flushList();
      html.push(`<h3 class="font-display text-xl font-semibold text-ink mt-6 mb-2 leading-tight">${inline(line.slice(4))}</h3>`);
      continue;
    }

    // Blockquote
    if (/^> /.test(line)) {
      flushList();
      const content = line.slice(2);
      if (isMostlyArabic(content)) {
        html.push(`<blockquote class="border-l-2 border-gold-500/50 pl-4 my-4"><p class="arabic text-gold-200 text-lg leading-loose" style="direction:rtl;text-align:right">${escapeHtml(content)}</p></blockquote>`);
      } else {
        html.push(`<blockquote class="border-l-2 border-emerald-500/40 pl-4 my-4 italic text-ink-muted">${inline(content)}</blockquote>`);
      }
      continue;
    }

    // Bullet list
    if (/^- /.test(line)) {
      if (listType !== "ul") { flushList(); listType = "ul"; }
      listBuffer.push(`<li class="text-ink-muted">${inline(line.slice(2))}</li>`);
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      if (listType !== "ol") { flushList(); listType = "ol"; }
      listBuffer.push(`<li class="text-ink-muted">${inline(line.replace(/^\d+\. /, ""))}</li>`);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Regular paragraph, auto-detect Arabic
    flushList();
    if (isMostlyArabic(line)) {
      html.push(`<p class="arabic text-gold-200 text-lg leading-loose my-3" style="direction:rtl;text-align:right">${escapeHtml(line)}</p>`);
    } else {
      html.push(`<p class="text-ink-muted leading-relaxed my-3">${inline(line)}</p>`);
    }
  }

  flushList();
  return html.join("\n");
};

window.renderMarkdown = renderMarkdown;
