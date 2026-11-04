import { scriptLang } from "../utils/lang";

// Plain text in, safe HTML elements out. Nothing the author types is ever treated as HTML.
// Blank line = new paragraph, "## " = heading, "- " = list item
function parse(text) {
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "ul", items: list });
    list = [];
  };

  for (const raw of (text || "").replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h", text: line.slice(3) });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

export default function ArticleBody({ content }) {
  const blocks = parse(content);

  return (
    <div className="space-y-4 text-base leading-8 text-ink">
      {blocks.map((b, i) => {
        if (b.type === "h") {
          return (
            <h2 key={i} lang={scriptLang(b.text)} dir="auto" className="!mt-8 text-2xl font-semibold text-primary">
              {b.text}
            </h2>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="list-disc space-y-1 ps-6">
              {b.items.map((item, j) => (
                <li key={j} lang={scriptLang(item)} dir="auto">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} lang={scriptLang(b.text)} dir="auto">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}