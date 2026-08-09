import { Achievement } from '../../shared/models/achievement.model';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  total: number;
}

function toDayKey(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayKeyFromOffset(referenceDate: Date, daysAgo: number): string {
  const date = new Date(referenceDate);
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function computeStreakStats(achievements: Achievement[], referenceDate: Date = new Date()): StreakStats {
  const daysWithAchievement = new Set(achievements.map(item => toDayKey(item.createdAt)));

  let currentStreak = 0;
  let offset = daysWithAchievement.has(dayKeyFromOffset(referenceDate, 0)) ? 0 : 1;
  // se hoje ainda não tem conquista, o streak continua "vivo" enquanto ontem tiver — o dia atual só quebra a sequência quando acabar sem registro
  while (daysWithAchievement.has(dayKeyFromOffset(referenceDate, offset))) {
    currentStreak++;
    offset++;
  }

  let longestStreak = 0;
  let running = 0;
  const sortedDays = Array.from(daysWithAchievement)
    .map(key => {
      const [year, month, day] = key.split('-').map(Number);
      return new Date(year, month, day).getTime();
    })
    .sort((a, b) => a - b);

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0 || sortedDays[i] - sortedDays[i - 1] === ONE_DAY_MS) {
      running++;
    } else {
      running = 1;
    }
    longestStreak = Math.max(longestStreak, running);
  }

  return {
    currentStreak,
    longestStreak,
    total: achievements.length
  };
}
