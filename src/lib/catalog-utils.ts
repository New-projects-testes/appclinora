// Shared helpers for the public catalog flow (mock data)

export const LINKEDIN_BLUE = "#0A66C2";

// Deterministic price per professional (R$ 150..350)
export function priceFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 150 + (h % 9) * 25;
}

// Deterministic slot generator per professional + day offset
export function slotsForProfessional(id: string, dayOffset: number): string[] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  h = (h + dayOffset * 7919) >>> 0;
  const base = [9, 10, 11, 14, 15, 16, 17, 18, 19];
  const slots: string[] = [];
  for (const hour of base) {
    if ((h >> hour) & 1) {
      const m = (h >> (hour + 3)) & 3; // 0,1,2,3 -> :00 :15 :30 :45
      slots.push(`${String(hour).padStart(2, "0")}:${["00", "15", "30", "45"][m]}`);
    }
  }
  // ensure at least 3 slots
  if (slots.length < 3) {
    return ["09:30", "14:00", "17:00"].slice(0, 3);
  }
  return slots;
}

export function dateForOffset(offset: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

export function formatDayLabel(offset: number): { label: string; sub: string } {
  const d = dateForOffset(offset);
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const label = offset === 0 ? "Hoje" : offset === 1 ? "Amanhã" : dayNames[d.getDay()];
  const sub = `${d.getDate()} ${monthNames[d.getMonth()]}`;
  return { label, sub };
}

export function formatFullDate(iso: string): string {
  const d = new Date(iso);
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}
