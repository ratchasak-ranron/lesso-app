import { hashIndex, type AiLocale } from './_hash';

const TEMPLATES_TH = [
  'สวัสดีค่ะคุณ {{name}} ครบรอบ {{weeks}} สัปดาห์แล้วนะคะ จองนัดครั้งต่อไปได้ที่ลิงก์นี้ค่ะ',
  'คุณ {{name}} ขา ถึงเวลานัดติดตาม {{service}} แล้วนะคะ ทักมาเลือกเวลาที่สะดวกได้เลยค่ะ',
  'หวัดดีค่ะคุณ {{name}} เห็นว่าหายไปนาน {{weeks}} สัปดาห์ ยินดีให้บริการต่อเนื่องค่ะ',
  'คุณ {{name}} ค่ะ คอร์ส {{service}} เหลืออีก {{remaining}} ครั้ง อย่าลืมมาทำให้ครบนะคะ',
  'สวัสดีค่ะคุณ {{name}} โปรโมชันพิเศษสำหรับลูกค้าประจำ — ทักมาสอบถามได้เลยค่ะ',
];

const TEMPLATES_EN = [
  'Hi {{name}}, it has been {{weeks}} weeks since your last visit — book your next session here.',
  'Hello {{name}}, time for your follow-up {{service}}. Reply to choose a slot.',
  'Hi {{name}}, we have not seen you in {{weeks}} weeks — happy to welcome you back.',
  'Hi {{name}}, you have {{remaining}} session(s) left on your {{service}} package. Book to complete it.',
  'Hi {{name}}, special offer for returning clients — message us to learn more.',
];

export interface RecallMessageInput {
  patientId: string;
  patientName: string;
  serviceName: string;
  weeksSinceLastVisit: number;
  remainingSessions: number;
  locale: AiLocale;
}

export function generateRecallMessage(input: RecallMessageInput): string {
  const templates = input.locale === 'th' ? TEMPLATES_TH : TEMPLATES_EN;
  const idx = hashIndex(`${input.patientId}:${input.serviceName}`, templates.length);
  const tpl = templates[idx]!;
  return tpl
    .replace(/\{\{name\}\}/g, input.patientName)
    .replace(/\{\{weeks\}\}/g, String(input.weeksSinceLastVisit))
    .replace(/\{\{service\}\}/g, input.serviceName)
    .replace(/\{\{remaining\}\}/g, String(input.remainingSessions));
}
