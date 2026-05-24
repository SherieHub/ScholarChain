export interface SemesterInfo {
  label: string;   // "1st Sem AY 2025-2026"
  start: Date;
  end: Date;
}

/**
 * Philippine academic calendar — 4 months per term:
 *   1st Sem : August   – November
 *   2nd Sem : December – March
 *   Summer  : April    – July
 */
export function getSemesterFromDate(date: Date): SemesterInfo {
  const month = date.getMonth() + 1; // 1–12
  const year = date.getFullYear();

  // Academic year label: AY starts in August
  const ayStart = month >= 8 ? year : year - 1;
  const ayLabel = `${ayStart}-${ayStart + 1}`;

  if (month >= 8 && month <= 11) {
    return {
      label: `1st Sem AY ${ayLabel}`,
      start: new Date(year, 7, 1),    // Aug 1
      end:   new Date(year, 10, 30),  // Nov 30
    };
  }

  if (month === 12 || month <= 3) {
    const decYear = month === 12 ? year : year - 1;
    return {
      label: `2nd Sem AY ${ayLabel}`,
      start: new Date(decYear, 11, 1),      // Dec 1
      end:   new Date(decYear + 1, 2, 31),  // Mar 31
    };
  }

  // Apr – Jul  →  Summer
  return {
    label: `Summer AY ${ayLabel}`,
    start: new Date(year, 3, 1),  // Apr 1
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
