interface JournalEntry {
  timestamp: string;
  prompt: string;
  response: string;
}

export const calculateStreaks = (entries: JournalEntry[]) => {
  if (!entries.length) {
    return {currentStreak: 0, bestStreak: 0};
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const entryDates = sortedEntries.map(entry => {
    const date = new Date(entry.timestamp);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastEntryDate = entryDates[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastEntryDate.getTime() === today.getTime()) {
    currentStreak = 1;
  } else if (lastEntryDate.getTime() === yesterday.getTime()) {
    currentStreak = 1;
  }

  if (currentStreak > 0) {
    for (let i = 1; i < entryDates.length; i++) {
      const currentDate = entryDates[i];
      const previousDate = new Date(entryDates[i - 1]);
      previousDate.setDate(previousDate.getDate() - 1);

      if (currentDate.getTime() === previousDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let bestStreak = currentStreak;
  let tempStreak = 1;

  for (let i = 1; i < entryDates.length; i++) {
    const currentDate = entryDates[i];
    const previousDate = new Date(entryDates[i - 1]);
    previousDate.setDate(previousDate.getDate() - 1);

    if (currentDate.getTime() === previousDate.getTime()) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    currentStreak,
    bestStreak,
  };
};

export const isStreakActive = (entries: JournalEntry[]): boolean => {
  if (!entries.length) {
    return false;
  }

  const {currentStreak} = calculateStreaks(entries);
  return currentStreak > 0;
};

export const getNextStreakMilestone = (currentStreak: number): number => {
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
  return milestones.find(milestone => milestone > currentStreak) || 365;
};
