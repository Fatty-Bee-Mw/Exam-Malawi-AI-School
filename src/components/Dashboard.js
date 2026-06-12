import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserLimits } from '../contexts/UserLimitsContext';
import { useUserStats } from '../contexts/UserStatsContext';
import AIAssistant from './AIAssistant';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import SubjectProgress from './SubjectProgress';
import {
  ChartBarIcon,
  BookOpenIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { currentPlan, limits, getRemainingQuestions, getRemainingExams } = useUserLimits();
  const { stats, getAverageScore, getStudyStreak } = useUserStats();
  const [activeTab, setActiveTab] = useState('assistant');

  const realStats = {
    questionsAnswered: stats.questionsAnswered,
    examsCompleted: stats.examsCompleted,
    averageScore: getAverageScore(),
    studyStreak: getStudyStreak(),
  };

  const tabs = [
    { id: 'assistant', label: 'AI Tutor', icon: SparklesIcon },
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'progress', label: 'Progress', icon: BookOpenIcon },
    { id: 'activity', label: 'Activity', icon: ClockIcon },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b border-dark-muted/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">
              Hi, {currentUser?.name}
            </h1>
            <p className="text-xs text-gray-400">
              {getRemainingQuestions()} questions · {getRemainingExams()} exams left today
            </p>
          </div>
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-dark-neon-blue/20 text-dark-neon-blue'
                      : 'text-gray-400 hover:text-white hover:bg-dark-accent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'assistant' && (
          <div className="h-full p-2 sm:p-3">
            <AIAssistant />
          </div>
        )}

        {activeTab !== 'assistant' && (
          <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatsCard title="Questions" value={realStats.questionsAnswered} icon={BookOpenIcon} color="blue" />
                  <StatsCard title="Exams" value={realStats.examsCompleted} icon={AcademicCapIcon} color="purple" />
                  <StatsCard
                    title="Avg Score"
                    value={realStats.averageScore > 0 ? `${realStats.averageScore}%` : 'N/A'}
                    icon={ChartBarIcon}
                    color="green"
                  />
                  <StatsCard
                    title="Streak"
                    value={realStats.studyStreak > 0 ? `${realStats.studyStreak}d` : '—'}
                    icon={FireIcon}
                    color="pink"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="card-hover p-4 rounded-xl lg:col-span-1">
                    <h3 className="text-sm font-semibold text-white mb-3">Usage Today</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between text-gray-400 mb-1">
                          <span>Questions</span>
                          <span>{getRemainingQuestions()} left</span>
                        </div>
                        <div className="h-1.5 bg-dark-muted rounded-full">
                          <div
                            className="h-1.5 bg-dark-neon-blue rounded-full"
                            style={{ width: `${(getRemainingQuestions() / limits.questionsPerDay) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-gray-400 mb-1">
                          <span>Exams</span>
                          <span>{getRemainingExams()} left</span>
                        </div>
                        <div className="h-1.5 bg-dark-muted rounded-full">
                          <div
                            className="h-1.5 bg-dark-neon-purple rounded-full"
                            style={{ width: `${(getRemainingExams() / limits.examsPerDay) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {currentPlan === 'free' && (
                      <p className="text-xs text-gray-500 mt-3">Upgrade for more daily questions and exams.</p>
                    )}
                  </div>
                  <div className="card-hover p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
                    <QuickActions />
                  </div>
                  <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <SubjectProgress />
                    <RecentActivity />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'progress' && (
              <div className="card-hover p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white mb-4">Subject Progress</h3>
                <SubjectProgress detailed />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="card-hover p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
                <RecentActivity detailed />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
