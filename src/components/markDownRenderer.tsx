import React from "react";
import { useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import CitationComponent from "./citationComponent";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
interface MarkdownRendererProps {
    content: string;
  }
  
  const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content }) => {
    const citationLinks = useMemo(() => {
    //   return [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(([_, text, link]) => ({
    //     text,
    //     link,
    //   }));
    return Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map(([_, text, link]) => ({
        text,
        link,
      }));
    }, [content]);
  
    const components: Partial<Components> = useMemo(() => ({
      a: ({ href, children }) => {
        if (!href) return null;
        const index = citationLinks.findIndex((link) => link.link === href);
        return index !== -1 ? (
          <CitationComponent href={href} index={index}>
            {children}
          </CitationComponent>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {children}
          </a>
        );
      },
    }), [citationLinks]);
  
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
        className="prose text-sm sm:text-base text-pretty text-left"
      >
        {content}
      </ReactMarkdown>
    );
  });
  
  MarkdownRenderer.displayName = "MarkdownRenderer";