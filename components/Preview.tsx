"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

type Props = {
  markdown: string;
};

// Schéma de GitHub, plus les attributs d'image utilisés par le générateur.
// vAlign est retiré : React ne le reconnaît pas (remplacé par du CSS dans globals.css).
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": (defaultSchema.attributes?.["*"] ?? []).filter((attr) => attr !== "vAlign"),
    img: [...(defaultSchema.attributes?.img ?? []), "width", "height", "align"],
  },
};

export function Preview({ markdown }: Props) {
  return (
    <div className="markdown-body max-w-none [column-fill:_balance]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
