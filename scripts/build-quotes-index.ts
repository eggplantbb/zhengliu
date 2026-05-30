import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'vendor/MaoZeDongAnthology/src');
const outPath = path.join(root, 'server/data/quotes.json');

export interface Quote {
  id: string;
  text: string;
  source: string;
  volume: string;
  articleNo: string;
}

function getVolume(articleNo: number): string {
  if (articleNo <= 17) return '第一卷';
  if (articleNo <= 57) return '第二卷';
  if (articleNo <= 88) return '第三卷';
  if (articleNo <= 158) return '第四卷';
  return '第五卷';
}

function cleanText(text: string): string {
  return text
    .replace(/^[\s　]+|[\s　]+$/g, '')
    .replace(/\s+/g, '')
    .replace(/^[（(].*[)）]$/, '');
}

function isQuotable(text: string): boolean {
  if (text.length < 15 || text.length > 120) return false;
  if (/^[>─\-=]/.test(text)) return false;
  if (/^注/.test(text)) return false;
  if (/^〔\d/.test(text)) return false;
  if (/^第[一二三四五六七八九十]+[卷部节章]/.test(text)) return false;
  if (/^（一九/.test(text)) return false;
  if (/^SUMMARY|^目录/.test(text)) return false;
  if (/^[0-9]{4}年/.test(text)) return false;
  if (/^http/.test(text)) return false;
  if (/^[a-zA-Z]/.test(text)) return false;
  // Prefer sentences with substantive content
  const hanCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  if (hanCount < 12) return false;
  return true;
}

function parseArticle(filePath: string, filename: string): Quote[] {
  const match = filename.match(/^(\d{3})-(.+)\.md$/);
  if (!match) return [];

  const articleNo = match[1];
  const titleFromFile = match[2];
  const articleNum = parseInt(articleNo, 10);
  const volume = getVolume(articleNum);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  let title = titleFromFile;
  for (const line of lines.slice(0, 5)) {
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      title = h1[1].trim();
      break;
    }
  }

  const quotes: Quote[] = [];
  let buffer = '';

  const flush = () => {
    const text = cleanText(buffer);
    if (isQuotable(text)) {
      quotes.push({
        id: `${articleNo}-${quotes.length}`,
        text,
        source: title,
        volume,
        articleNo,
      });
    }
    buffer = '';
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('>')) continue;
    if (trimmed.includes('----------')) continue;
    if (trimmed.startsWith('注　　释') || trimmed.startsWith('注 释')) break;

    const content = line.replace(/^　　/, '').trim();
    if (!content) continue;

    if (buffer) buffer += content;
    else buffer = content;

    if (buffer.length >= 120) flush();
  }
  flush();

  return quotes;
}

function main() {
  if (!fs.existsSync(srcDir)) {
    console.error(`Anthology not found at ${srcDir}`);
    console.error('Run: git clone https://github.com/weiyinfu/MaoZeDongAnthology.git vendor/MaoZeDongAnthology');
    process.exit(1);
  }

  const files = fs
    .readdirSync(srcDir)
    .filter((f) => /^\d{3}-.+\.md$/.test(f))
    .sort();

  const allQuotes: Quote[] = [];
  for (const file of files) {
    allQuotes.push(...parseArticle(path.join(srcDir, file), file));
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(allQuotes, null, 2), 'utf-8');
  console.log(`Built ${allQuotes.length} quotes from ${files.length} articles → ${outPath}`);
}

main();
