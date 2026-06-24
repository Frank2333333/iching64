/**
 * 结构化经典文献 — 注册表 + 查询/搜索 API
 */
import type { Book, Chapter, Paragraph, SearchHit } from './types';

export type { Book, Chapter, Paragraph, SearchHit };
import { guSuiFu } from './gusuifu';
import { ziWeiQuanJi } from './quanji';
import { ziWeiQuanShu } from './quanshu';

/** 所有注册的经典 */
export const ALL_BOOKS: Book[] = [guSuiFu, ziWeiQuanJi, ziWeiQuanShu];

/** 总段落数 */
export const TOTAL_PARAGRAPHS = ALL_BOOKS.reduce(
  (sum, book) => sum + book.chapters.reduce((s, ch) => s + ch.paragraphs.length, 0),
  0,
);

/** 按 slug 查找书 */
export function getBookBySlug(slug: string): Book | null {
  return ALL_BOOKS.find((b) => b.slug === slug) ?? null;
}

/** 获取指定书的指定章节（返回带书上下文） */
export function getChapter(
  bookSlug: string,
  chapterIdx: number,
): { book: Book; chapter: Chapter } | null {
  const book = getBookBySlug(bookSlug);
  if (!book) return null;
  const chapter = book.chapters[chapterIdx];
  if (!chapter) return null;
  return { book, chapter };
}

/** 按 ID 查找段落（返回完整上下文） */
export function getParagraphById(
  id: string,
): { book: Book; chapter: Chapter; paragraph: Paragraph } | null {
  for (const book of ALL_BOOKS) {
    for (const chapter of book.chapters) {
      const paragraph = chapter.paragraphs.find((p) => p.id === id);
      if (paragraph) return { book, chapter, paragraph };
    }
  }
  return null;
}

/** 全文搜索 */
export function searchClassics(query: string, limit = 30): SearchHit[] {
  if (!query.trim()) return [];

  const hits: SearchHit[] = [];
  const q = query.toLowerCase();

  for (const book of ALL_BOOKS) {
    for (const chapter of book.chapters) {
      for (const paragraph of chapter.paragraphs) {
        const textLower = paragraph.text.toLowerCase();
        const idx = textLower.indexOf(q);
        if (idx === -1) continue;

        // 提取上下文摘要（前后各40字）
        const start = Math.max(0, idx - 40);
        const end = Math.min(paragraph.text.length, idx + q.length + 40);
        const snippet =
          (start > 0 ? '...' : '') +
          paragraph.text.substring(start, idx) +
          '<mark>' +
          paragraph.text.substring(idx, idx + q.length) +
          '</mark>' +
          paragraph.text.substring(idx + q.length, end) +
          (end < paragraph.text.length ? '...' : '');

        hits.push({
          bookSlug: book.slug,
          bookTitle: book.title,
          chapterTitle: chapter.title,
          paragraphId: paragraph.id,
          snippet,
          text: paragraph.text,
        });

        if (hits.length >= limit) return hits;
      }
    }
  }

  return hits;
}
