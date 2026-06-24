/**
 * 结构化经典文献 — 类型定义
 *
 * 数据模型：Book > Chapter > Paragraph
 * 沿用 ziwei-doushu 参考项目的经典文献体系
 */

/** 段落 */
export interface Paragraph {
  id: string;           // 唯一ID，如 'gsf-1-1'
  idx: number;          // 段落序号
  text: string;         // 古文原文
  translation?: string; // 现代译文（预留）
  niNote?: string;      // 倪海厦注解（预留）
}

/** 章节 */
export interface Chapter {
  title: string;
  subtitle?: string;
  paragraphs: Paragraph[];
}

/** 书 */
export interface Book {
  title: string;        // 书名
  slug: string;         // URL标识
  dynasty: string;      // 朝代
  author: string;       // 作者
  intro: string;        // 简介
  wordCount: number;    // 字数
  chapters: Chapter[];
}

/** 搜索结果 */
export interface SearchHit {
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  paragraphId: string;
  snippet: string;      // 带 <mark> 高亮的摘要
  text: string;         // 原文
}
