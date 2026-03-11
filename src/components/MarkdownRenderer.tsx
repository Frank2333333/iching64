import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-indigo dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义标题样式
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mt-6 mb-3 border-b border-indigo-200 dark:border-indigo-800 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mt-5 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mt-4 mb-2">
              {children}
            </h3>
          ),
          // 段落样式
          p: ({ children }) => (
            <p className="text-indigo-900 dark:text-indigo-100 leading-relaxed mb-3">
              {children}
            </p>
          ),
          // 列表样式
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 text-indigo-900 dark:text-indigo-100 mb-3">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 text-indigo-900 dark:text-indigo-100 mb-3">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">
              {children}
            </li>
          ),
          // 加粗和强调
          strong: ({ children }) => (
            <strong className="font-bold text-indigo-800 dark:text-indigo-200">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-indigo-700 dark:text-indigo-300">
              {children}
            </em>
          ),
          // 引用块
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-300 dark:border-indigo-700 pl-4 py-2 my-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-r">
              {children}
            </blockquote>
          ),
          // 代码块
          code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
            const isInline = !className;
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded text-sm">
                {children}
              </code>
            ) : (
              <pre className="bg-indigo-950/50 dark:bg-black/30 p-4 rounded-lg overflow-x-auto my-4">
                <code className={`${className} text-sm text-indigo-100`}>
                  {children}
                </code>
              </pre>
            );
          },
          // 分割线
          hr: () => (
            <hr className="my-6 border-indigo-200 dark:border-indigo-800" />
          ),
          // 链接
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
