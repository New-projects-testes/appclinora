// Shared helpers for /catalogo and the agendamento flow

export const PRICE_MIN = 150;
export const PRICE_MAX = 350;
export const LINKEDIN_BLUE = "#0A66C2";

// Deterministic price per professional (mock)
export function priceFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 150 + (h % 9) * 25; // 150..350
}

// Deterministic available time slots per professional + day
// Returns slots between 09:00 and 18:00 in 30-min steps, with some marked busy
export type Slot = { time: string; available: boolean };

export function slotsFor(proId: string, date: Date): Slot[] {
  const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let h = 0;
  const seed = proId + dayKey;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const slots: Slot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    for (const m of [0, 30]) {
      h = (h * 1103515245 + 12345) >>> 0;
      const available = (h % 10) > 3; // ~60% available
      slots.push({
        time: `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        available,
      });
    }
  }
  return slots;
}
