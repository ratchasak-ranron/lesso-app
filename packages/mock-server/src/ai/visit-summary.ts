import { hashIndex, type AiLocale } from './_hash';

const TEMPLATES_TH = [
  'ผู้ป่วยมาทำหัตถการ {{service}} เป็นครั้งที่ {{n}} อาการดี ไม่มีผลข้างเคียง นัดครั้งต่อไปใน 4 สัปดาห์',
  'ทำ {{service}} ตามแผน อาการตอบสนองดี แนะนำให้ดูแลผิวด้วยครีมกันแดดต่อเนื่อง',
  'หัตถการ {{service}} ครั้งที่ {{n}} เรียบร้อย ผิวฟื้นตัวเร็วกว่าครั้งก่อน',
  'ทำ {{service}} ครั้งที่ {{n}} ผู้ป่วยพอใจกับผลลัพธ์ แนะนำคอร์สต่อเนื่องตามแผน',
  '{{service}} session {{n}} เสร็จสิ้น สังเกตเห็นผลลัพธ์ชัดเจนหลังครั้งที่ 3 แล้ว',
  'ทำ {{service}} ตามปกติ ไม่มีอาการระคายเคือง นัดติดตามอีก 2 สัปดาห์',
];

const TEMPLATES_EN = [
  'Patient completed {{service}} session {{n}}. Tolerated well. No adverse reactions. Recall in 4 weeks.',
  '{{service}} performed per plan. Good response. Continue daily SPF and gentle cleanser.',
  'Session {{n}} of {{service}} complete. Recovery faster than previous visit.',
  '{{service}} session {{n}}. Patient satisfied with progress. Recommend completing the package.',
  '{{service}} session {{n}} complete. Visible improvement noted from session 3 onwards.',
  '{{service}} performed routinely. No irritation. Follow-up in 2 weeks.',
];

export interface VisitSummaryInput {
  patientId: string;
  serviceName: string;
  sessionN: number;
  locale: AiLocale;
}

export function generateVisitSummary(input: VisitSummaryInput): string {
  const templates = input.locale === 'th' ? TEMPLATES_TH : TEMPLATES_EN;
  const idx = hashIndex(`${input.patientId}:${input.serviceName}:${input.sessionN}`, templates.length);
  const tpl = templates[idx]!;
  return tpl.replace(/\{\{service\}\}/g, input.serviceName).replace(/\{\{n\}\}/g, String(input.sessionN));
}
