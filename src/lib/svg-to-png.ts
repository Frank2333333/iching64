/**
 * SVG → PNG 分享工具（零依赖）
 *
 * 把页面中已渲染的 <svg> 节点序列化为 PNG：序列化 → 加载为 Image → 绘到 canvas → toBlob。
 * 支持下载文件 + 复制到剪贴板（best-effort，部分浏览器需 https 且需用户手势）。
 *
 * 要求：目标 SVG 自包含（内联属性/样式，不依赖外部 CSS 与字体文件）；文字用系统字体栈。
 */

/** 内联 SVG 的 XML 命名空间头 */
const SVG_NS = 'http://www.w3.org/2000/svg';

/** 估算 SVG 的固有宽高（取 width/height 属性或 viewBox） */
function getSvgSize(svg: SVGSVGElement): { width: number; height: number } {
  const w = parseFloat(svg.getAttribute('width') || '0');
  const h = parseFloat(svg.getAttribute('height') || '0');
  if (w && h) return { width: w, height: h };
  const vb = svg.getAttribute('viewBox');
  if (vb) {
    const parts = vb.split(/[\s,]+/).map(Number);
    if (parts.length === 4) return { width: parts[2], height: parts[3] };
  }
  const bb = svg.getBoundingClientRect();
  return { width: bb.width || 750, height: bb.height || 1334 };
}

/** 序列化 SVG 节点为带声明与命名空间的字符串 */
function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', SVG_NS);
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  // 确保有明确尺寸，避免渲染为 0
  const { width, height } = getSvgSize(svg);
  if (!clone.getAttribute('width')) clone.setAttribute('width', String(width));
  if (!clone.getAttribute('height')) clone.setAttribute('height', String(height));
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

/** 把 SVG 节点导出为 PNG Blob */
export async function svgToPngBlob(svg: SVGSVGElement, scale = 2): Promise<Blob> {
  const { width, height } = getSvgSize(svg);
  const xml = serializeSvg(svg);
  const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('SVG 加载失败'));
    img.src = svgDataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 不可用');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG 生成失败'));
    }, 'image/png');
  });
}

/** 下载 PNG */
export async function downloadSvgAsPng(svg: SVGSVGElement, filename: string, scale = 2): Promise<void> {
  const blob = await svgToPngBlob(svg, scale);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 复制 PNG 到剪贴板（不支持则返回 false） */
export async function copySvgAsPng(svg: SVGSVGElement, scale = 2): Promise<boolean> {
  try {
    const blob = await svgToPngBlob(svg, scale);
    const w = navigator as Navigator & { clipboard?: { write: (items: ClipboardItem[]) => Promise<void> } };
    if (!w.clipboard || typeof w.clipboard.write !== 'function') return false;
    // ClipboardItem 在部分浏览器需显式引用
    const ClipboardItemCtor = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    if (!ClipboardItemCtor) return false;
    await w.clipboard.write([new ClipboardItemCtor({ [blob.type]: blob })]);
    return true;
  } catch {
    return false;
  }
}
