"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useTheme } from "next-themes";
import Head from "next/head";

type Props = {
  markdown: string;
};

export function Preview({ markdown }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const href = resolvedTheme === "dark"
    ? "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-dark.min.css"
    : "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-light.min.css";
  return (
    <>
      <Head>
        <link rel="stylesheet" href={href} key={`ghmd-${resolvedTheme}`} />
      </Head>
      <div className="markdown-body max-w-none [column-fill:_balance]">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>
      </div>
    </>
  );
}


