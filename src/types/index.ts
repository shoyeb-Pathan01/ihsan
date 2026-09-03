export interface DashboardData {
  dayNumber: number;
  daysRemaining: number;
  missionCompleted: boolean;
  overallProgress: number;
  azureProgress: number;
  arabicProgress: number;
  todayFocus: string;
  todayFocusWhy: string;
  mustDoTasks: DailyTaskData[];
  optionalTasks: DailyTaskData[];
  revisionDue: number;
  strongest: { name: string; value: string };
  needsAttention: { name: string; value: string };
  nextMilestone: { name: string; remaining: number };
  reminder: ReminderData;
  readingPages: number;
  memorizationCount: number;
  tahajjudNights: number;
  communicationSessions: number;
}

export interface DailyTaskData {
  id: string;
  title: string;
  category: string;
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
