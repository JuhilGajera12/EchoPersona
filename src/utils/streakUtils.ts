interface JournalEntry {
  timestamp: string;
  prompt: string;
  response: string;
}

export const calculateStreaks = (entries: JournalEntry[]) => {
  if (!entries.length) {
    return {currentStreak: 0, bestStreak: 0};
  }

  const uniqueDates = Array.from(
    new Set(
      entries.map(entry => {
        const date = new Date(entry.timestamp);
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ).getTime();
      }),
    ),
  )
    .map(ms => new Date(ms))
    .sort((a, b) => b.getTime() - a.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let currentStreak = 1;
  let bestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i - 1];
    const currDate = uniqueDates[i];

    const expectedPrevDate = new Date(prevDate);
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);

    if (currDate.getTime() === expectedPrevDate.getTime()) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  const latestEntry = uniqueDates[0];
  if (
    latestEntry.getTime() === today.getTime() ||
    latestEntry.getTime() === yesterday.getTime()
  ) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = uniqueDates[i - 1];
      const currDate = uniqueDates[i];

      const expectedPrevDate = new Date(prevDate);
      expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);

      if (currDate.getTime() === expectedPrevDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    bestStreak,
  };
};

export const isStreakActive = (entries: JournalEntry[]): boolean => {
  const {currentStreak} = calculateStreaks(entries);
  return currentStreak > 0;
};

export const getNextStreakMilestone = (currentStreak: number): number => {
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
  return milestones.find(m => m > currentStreak) || 365;
};
