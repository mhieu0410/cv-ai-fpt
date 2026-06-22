const fs = require('fs');
const path = require('path');
const base = 'd:/EXE/cv-ai-fpt/components/cv-templates';
const dirs = fs.readdirSync(base).filter(f => fs.statSync(path.join(base, f)).isDirectory());

for (const dir of dirs) {
  const pdfPath = path.join(base, dir, 'pdf.tsx');
  if (fs.existsSync(pdfPath)) {
    let content = fs.readFileSync(pdfPath, 'utf8');
    
    if (!content.includes('WatermarkPdf')) {
      content = content.replace(/import type \{ CvData \} from '\.\.\/types'/, "import type { CvData } from '../types'\nimport { WatermarkPdf } from '../WatermarkPdf'");
    }
    
    content = content.replace(/export function (\w+Pdf|CorporatePdf)\(\{ data \}: \{ data: CvData \}\) \{/, "export function $1({ data, isPro }: { data: CvData; isPro?: boolean }) {");
    
    if (!content.includes('<WatermarkPdf')) {
      content = content.replace(/(<Page[^>]*>)/, "$1\n        <WatermarkPdf isPro={isPro} />");
    }

    fs.writeFileSync(pdfPath, content);
    console.log('Patched', pdfPath);
  }
}
console.log('Done patching pdfs!');
