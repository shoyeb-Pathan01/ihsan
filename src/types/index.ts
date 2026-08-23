export interface DashboardData {
  dayNumber: number;
  daysRemaining: number;
  missionCompleted: boolean;
  overallProgress: number;
  azureProgress: number;
  arabicProgress: number;
  currentStreak: number;
  bestStreak: number;
  totalXP: number;
  level: { level: number; name: string; current: number; next: number };
  todayFocus: string;
  todayFocusWhy: string;
  mustDoTasks: DailyTaskData[];
  optionalTasks: DailyTaskData[];
  revisionDue: number;
  strongest: { name: string; value: string };
  needsAttention: { name: string; value: string };
  nextMilestone: { name: string; remaining: number };
  consistencyThisWeek: number;
  consistencyLastWeek: number;
  consistencyTrend: number;
  reminder: ReminderData;
  readingStreak: number;
  memorizationCount: number;
  tahajjudStreak: number;
  communicationSessions: number;
}

export interface DailyTaskData {
  id: string;
  title: string;
  category: string;
  xpValue: number;
  completed: boolean;
  isMustDo: boolean;
}

export interface ReminderData {
  text: string;
  source: string;
  reference: string;
  category: string;
}

export interface AzureModuleData {
  id: string;
  name: string;
  topics: AzureTopicData[];
  completionPct: number;
  topicCount: number;
  masteredCount: number;
}

export interface AzureTopicData {
  id: string;
  name: string;
  priority: string;
  status: string;
  completionPct: number;
  masteryPct: number;
  confidence: number;
  labCompleted: boolean;
  revisionCount: number;
  lastRevised: string | null;
  nextRevision: string | null;
  sessionId?: string;
}

export interface ArabicLectureData {
  id: string;
  lectureNumber: number;
  title: string;
  durationSeconds: number | null;
  watched: boolean;
  book: boolean;
  notes: boolean;
  examples: boolean;
  practice: boolean;
  revision: boolean;
  quiz: boolean;
  doubtsCleared: boolean;
  lectureProgress: number;
  understanding: number;
  confidence: number;
  mastery: number;
  lastRevised: string | null;
  nextRevision: string | null;
  revisionCount: number;
}

export interface ProjectData {
  id: string;
  name: string;
  objective: string | null;
  status: string;
  completionPct: number;
  taskCount: number;
  completedTasks: number;
}

export interface XPEvent {
  amount: number;
  source: string;
  description: string;
}

export const BADGES = [
  { key: "first_step", name: "First Step", description: "Complete your first task", icon: "🎯" },
  { key: "3day_momentum", name: "3-Day Momentum", description: "3 day streak", icon: "🔥" },
  { key: "7day_flame", name: "7-Day Flame", description: "7 day streak", icon: "🔥" },
  { key: "14day_discipline", name: "14-Day Discipline", description: "14 day streak", icon: "💪" },
  { key: "30day_discipline", name: "30-Day Discipline", description: "30 day streak", icon: "🏆" },
  { key: "100xp", name: "Century", description: "Earn 100 XP", icon: "⭐" },
  { key: "azure_builder", name: "Azure Builder", description: "Complete 10 Azure topics", icon: "☁️" },
  { key: "azure_networker", name: "Azure Networker", description: "Master networking module", icon: "🌐" },
  { key: "cloud_admin", name: "Cloud Administrator", description: "75% Azure completion", icon: "☁️" },
  { key: "arabic_beginner", name: "Arabic Beginner", description: "Complete 10 Arabic lectures", icon: "📖" },
  { key: "quran_student", name: "Qur'an Student", description: "25% Arabic mastery", icon: "🤲" },
  { key: "quran_reader", name: "Qur'an Reader", description: "7-day reading streak", icon: "📖" },
  { key: "tahajjud_consistency", name: "Tahajjud Consistency", description: "7 day Tahajjud streak", icon: "🌙" },
  { key: "memorization_journey", name: "Memorization Journey", description: "Start memorizing", icon: "📝" },
  { key: "communication_builder", name: "Communication Builder", description: "10 communication sessions", icon: "🗣️" },
  { key: "60day_finisher", name: "60-Day Finisher", description: "Complete the 60-day mission", icon: "🏅" },
] as const;
