"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type Props = {
  markdown: string;
};

export function Preview({ markdown }: Props) {
  return (
    <div className="markdown-body max-w-none [column-fill:_balance]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>
    </div>
  );
}


