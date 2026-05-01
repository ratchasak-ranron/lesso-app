import { hashIndex, type AiLocale } from './_hash';

export interface SlotSuggestionInput {
  patientId: string;
  doctorId?: string;
  serviceName: string;
  preferDays?: ReadonlyArray<number>; // 0=Sun..6=Sat
  locale: AiLocale;
}

export interface SuggestedSlot {
  startAt: string;
  endAt: string;
  rationale: string;
}

const RATIONALE_TH = [
  'แพทย์ว่างและตรงกับนัดครั้งก่อนของผู้ป่วย',
  'ช่วงเวลาที่คนไข้นัดบ่อยที่สุด',
  'หลังเลิกงาน — เหมาะกับคนไข้ส่วนใหญ่',
  'ช่วงเช้า สดชื่น แพทย์มีเวลามากกว่า',
];

const RATIONALE_EN = [
  'Matches the doctor\'s availability and patient\'s prior visit pattern.',
  'Most common booking window for this patient.',
  'After-work slot — popular with returning patients.',
  'Morning slot — doctor has more buffer time.',
];

/**
 * Pinned to the start of the current calendar day (local 00:00) so repeated
 * calls within the same day return identical timestamps. Crossing midnight
 * shifts the base by one day — acceptable trade-off; the alternative (fully
 * fixed epoch) would surface stale "next slot" times to receptionists.
 */
function nextWorkdayAt(daysAhead: number, hour: number): { startAt: string; endAt: string } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + daysAhead);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60_000);
  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

export function suggestSlots(input: SlotSuggestionInput): SuggestedSlot[] {
  const rationales = input.locale === 'th' ? RATIONALE_TH : RATIONALE_EN;
  const seedKey = `${input.patientId}:${input.doctorId ?? ''}:${input.serviceName}`;
  // 3 deterministic suggestions based on input hash
  const baseDay = (hashIndex(seedKey, 5) + 2) % 7;
  return [
    {
      ...nextWorkdayAt(baseDay + 0, 10),
      rationale: rationales[hashIndex(`${seedKey}:0`, rationales.length)]!,
    },
    {
      ...nextWorkdayAt(baseDay + 2, 14),
      rationale: rationales[hashIndex(`${seedKey}:1`, rationales.length)]!,
    },
    {
      ...nextWorkdayAt(baseDay + 4, 17),
      rationale: rationales[hashIndex(`${seedKey}:2`, rationales.length)]!,
    },
  ];
}
