"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Target, Star, ChevronRight, Moon } from "lucide-react";

interface QuranJourneyData {
  arabic: {
    lecturesWatched: number;
    totalLectures: number;
    averageMastery: number;
    lectureData: Array<{
      id: number;
      name: string;
      mastery: number;
      status: string;
    }>;
  };
  reading: {
    streak: number;
    totalPages: number;
    thisWeekPages: number;
    monthlyConsistency: number;
  };
  memorization: {
    surahsCount: number;
    revisionSessions: number;
    weakAreas: string[];
  };
  tahajjud: {
    streak: number;
    monthlyConsistency: number;
  };
  pacing: {
    lecturesStartedPerWeek: number;
    estimatedCompletionDay: number;
    revisionDaysLeft: number;
  };
}

export default function QuranJourneyPage() {
  const [data, setData] = useState<QuranJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/quran-journey");
        if (!response.ok) {
          throw new Error("Failed to fetch Quran journey data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium mb-4">Error loading data</p>
          <p className="text-gray-600">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const arabicMasteryPercent = Math.round((data.arabic.lecturesWatched / data.arabic.totalLectures) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-3xl mb-2 text-emerald-800">﷽</p>
            <h1 className="text-3xl font-bold text-emerald-900 tracking-wide">QUR'AN JOURNEY</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Lisān-ul-Qur'ān (Arabic) Card */}
          <a
            href="/quran-journey/arabic"
            className="group block bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <BookOpen className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-emerald-900">Lisān-ul-Qur'ān</h2>
                  <p className="text-sm text-emerald-600">Arabic Language</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lectures Progress</span>
                <span className="font-semibold text-emerald-800">
                  {data.arabic.lecturesWatched}/{data.arabic.totalLectures}
                </span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${arabicMasteryPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Mastery</span>
                <span className="font-semibold text-emerald-800">{data.arabic.averageMastery}%</span>
              </div>
            </div>
          </a>

          {/* Qur'an Reading Card */}
          <a
            href="/quran-journey/reading"
            className="group block bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Clock className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-900">Qur'an Reading</h2>
                  <p className="text-sm text-green-600">Daily Recitation</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-green-400 group-hover:text-green-600 transition-colors" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Streak</span>
                <span className="font-semibold text-green-800">{data.reading.streak} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pages Read</span>
                <span className="font-semibold text-green-800">{data.reading.totalPages}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-semibold text-green-800">{data.reading.thisWeekPages} pages</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Consistency</span>
                <span className="font-semibold text-green-800">{data.reading.monthlyConsistency}%</span>
              </div>
            </div>
          </a>

          {/* Memorization (حفظ) Card */}
          <a
            href="/quran-journey/memorization"
            className="group block bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-yellow-900">Memorization (حفظ)</h2>
                  <p className="text-sm text-yellow-600">Hifz Journey</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-yellow-400 group-hover:text-yellow-600 transition-colors" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Surahs Memorized</span>
                <span className="font-semibold text-yellow-800">{data.memorization.surahsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revision Sessions</span>
                <span className="font-semibold text-yellow-800">{data.memorization.revisionSessions}</span>
              </div>
              {data.memorization.weakAreas.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Areas to Review:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.memorization.weakAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </a>

          {/* Tahajjud Card */}
          <a
            href="/quran-journey/tahajjud"
            className="group block bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Moon className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-purple-900">Tahajjud</h2>
                  <p className="text-sm text-purple-600">Night Prayer</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Streak</span>
                <span className="font-semibold text-purple-800">{data.tahajjud.streak} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Consistency</span>
                <span className="font-semibold text-purple-800">{data.tahajjud.monthlyConsistency}%</span>
              </div>
            </div>
          </a>
        </div>

        {/* Pacing Indicator */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-bold text-emerald-900">Arabic Learning Pace</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            At your current pace, you'll finish new lectures around{" "}
            <span className="font-semibold text-emerald-700">Day {data.pacing.estimatedCompletionDay}</span>,
            leaving{" "}
            <span className="font-semibold text-emerald-700">{data.pacing.revisionDaysLeft} days</span>{" "}
            for pure revision.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Current pace: {data.pacing.lecturesStartedPerWeek} lectures/week</span>
          </div>
        </div>

        {/* Why This Matters Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-100 shadow-lg">
          <h3 className="text-xl font-bold text-emerald-900 mb-4">Why This Matters</h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            Translation padhne wale se Qur'an ko Arabic mein samajhne wale learner tak. The long-term
            destination is direct Qur'anic comprehension through Arabic grammar, Qur'anic vocabulary,
            and continuous practice.
          </p>
        </div>
      </div>
    </div>
  );
}
