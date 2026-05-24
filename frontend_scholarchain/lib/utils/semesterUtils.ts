export interface SemesterInfo {
  label: string;   // "1st Sem AY 2025-2026"
  start: Date;
  end: Date;
}

/**
 * Standard academic calendar:
 *   1st Sem  : August 15   – December 31
 *   2nd Sem  : January 15  – May 31
 *   Mid Year : June 1      – July 31
 */
export function getSemesterFromDate(date: Date): SemesterInfo {
  const month = date.getMonth() + 1; // 1–12
  const day   = date.getDate();
  const year  = date.getFullYear();

  // Academic year label: AY starts in August
  const ayStart = month >= 8 ? year : year - 1;
  const ayLabel = `${ayStart}-${ayStart + 1}`;

  // Aug 15 – Dec 31  →  1st Sem
  if (month >= 9 || (month === 8 && day >= 15)) {
    return {
      label: `1st Sem AY ${ayLabel}`,
      start: new Date(year, 7, 15),   // Aug 15
      end:   new Date(year, 11, 31),  // Dec 31
    };
  }

  // Jan 15 – May 31  →  2nd Sem
  if ((month === 1 && day >= 15) || (month >= 2 && month <= 5)) {
    return {
      label: `2nd Sem AY ${ayLabel}`,
      start: new Date(year, 0, 15),  // Jan 15
      end:   new Date(year, 4, 31),  // May 31
    };
  }

  // Jun 1 – Jul 31  →  Mid Year
  if (month === 6 || month === 7) {
    return {
      label: `Mid Year AY ${ayLabel}`,
      start: new Date(year, 5, 1),   // Jun 1
      end:   new Date(year, 6, 31),  // Jul 31
    };
  }

  // Jan 1–14 and Aug 1–14 are transition gaps — treat as the semester
  // that just ended (next semester hasn't started yet).
  // Jan 1–14: still under 1st Sem of the previous AY
  if (month === 1) {
    return {
      label: `1st Sem AY ${ayStart - 1}-${ayStart}`,
      start: new Date(year - 1, 7, 15),  // Aug 15 of prev year
      end:   new Date(year - 1, 11, 31), // Dec 31 of prev year
    };
  }

  // Aug 1–14: still under Mid Year of the current AY
  return {
    label: `Mid Year AY ${ayLabel}`,
    start: new Date(year, 5, 1),  // Jun 1
    end:   new Date(year, 6, 31), // Jul 31
  };
}

export function getCurrentSemester(): SemesterInfo {
  return getSemesterFromDate(new Date());
}

export function getNextSemester(): SemesterInfo {
  const current = getCurrentSemester();
  const dayAfter = new Date(current.end);
  dayAfter.setDate(dayAfter.getDate() + 1);
  return getSemesterFromDate(dayAfter);
}

export function isSemesterActive(start: Date, end: Date): boolean {
  const now = new Date();
  return now >= start && now <= end;
}
