import type { DivinationResult } from './meihua-divination';

interface QuestionScene {
  id: string;
  name: string;
}

export function stripMarkdownForSummary(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~`>|]/g, '')
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function extractInterpretationExcerpt(content: string, maxLength = 220): string {
  const cleaned = stripMarkdownForSummary(content);

  if (!cleaned) {
    return '';
  }

  const segments = cleaned
    .split('\n')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const excerpt = segments.find((segment) => segment.length >= 18) || segments[0] || cleaned;
  return excerpt.length > maxLength
    ? `${excerpt.slice(0, maxLength).trim()}...`
    : excerpt;
}

export function buildInitialInterpretationSummary(
  divinationResult: DivinationResult,
  aiContent: string,
  selectedScene: QuestionScene | null,
  questionContent: string
): string {
  const summaryLines: string[] = [];

  if (selectedScene) {
    summaryLines.push(`问事场景：${selectedScene.name}`);
  }

  if (questionContent.trim()) {
    summaryLines.push(`具体问题：${questionContent.trim()}`);
  }

  if (divinationResult.gua) {
    summaryLines.push(
      `本卦：${divinationResult.gua.chineseName}（${divinationResult.gua.name}），${divinationResult.gua.meaning}`
    );
  }

  if (divinationResult.dongYao) {
    summaryLines.push(`动爻：${divinationResult.dongYao.name}，爻辞为"${divinationResult.dongYao.text}"`);
  }

  summaryLines.push(
    `体用关系：体卦${divinationResult.tiGuaName}，用卦${divinationResult.yongGuaName}，${divinationResult.wuxingDetail.judgment}`
  );

  if (divinationResult.huGua || divinationResult.bianGua) {
    summaryLines.push(
      `变化路径：互卦${divinationResult.huGua?.shangGuaName || '?'}${divinationResult.huGua?.xiaGuaName || '?'}，变卦${divinationResult.bianGua?.shangGuaName || '?'}${divinationResult.bianGua?.xiaGuaName || '?'}`
    );
  }

  if (divinationResult.yingQi.description) {
    summaryLines.push(`应期推断：${divinationResult.yingQi.description}`);
  }

  const aiExcerpt = extractInterpretationExcerpt(aiContent);
  if (aiExcerpt) {
    summaryLines.push(`AI解卦要点：${aiExcerpt}`);
  }

  return summaryLines.join('\n');
}
