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
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { currentPlan, getRemainingQuestions, getRemainingExams } = useUserLimits();
  const { stats, getAverageScore, getStudyStreak } = useUserStats();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate real stats
  const realStats = {
    questionsAnswered: stats.questionsAnswered,
    examsCompleted: stats.examsCompleted,
    averageScore: getAverageScore(),
    studyStreak: getStudyStreak()
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'assistant', label: 'AI Assistant', icon: SparklesIcon },
    { id: 'progress', label: 'Progress', icon: BookOpenIcon },
    { id: 'activity', label: 'Activity', icon: ClockIcon }
  ];

  return (
    <div className="min-h-screen bg-dark-primary p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold neon-text mb-2">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="text-gray-400">
            Ready to continue your learning journey? Here's your progress overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Questions Answered"
            value={realStats.questionsAnswered}
            icon={BookOpenIcon}
            color="blue"
          />
          <StatsCard
            title="Exams Completed"
            value={realStats.examsCompleted}
            icon={AcademicCapIcon}
            color="purple"
          />
          <StatsCard
            title="Average Score"
            value={realStats.averageScore > 0 ? `${realStats.averageScore}%` : 'N/A'}
            icon={ChartBarIcon}
            color="green"
          />
          <StatsCard
            title="Study Streak"
            value={realStats.studyStreak > 0 ? `${realStats.studyStreak} ${realStats.studyStreak === 1 ? 'day' : 'days'}` : 'Start today!'}
            icon={FireIcon}
            color="pink"
            trend={realStats.studyStreak > 0 ? "🔥" : ""}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="card-hover p-6 rounded-xl mb-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Usage Today</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Questions</span>
                    <span className="text-dark-neon-blue">
                      {getRemainingQuestions()} left
                    </span>
                  </div>
                  <div className="w-full bg-dark-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-dark-neon-blue to-cyan-500 h-2 rounded-full"
                      style={{ width: `${(getRemainingQuestions() / (currentPlan === 'premium' ? 100 : 10)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Exams</span>
                    <span className="text-dark-neon-purple">
                      {getRemainingExams()} left
                    </span>
                  </div>
                  <div className="w-full bg-dark-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-dark-neon-purple to-pink-500 h-2 rounded-full"
                      style={{ width: `${(getRemainingExams() / (currentPlan === 'premium' ? 20 : 3)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              {currentPlan === 'free' && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                  <p className="text-xs text-dark-neon-green mb-2">Upgrade to Premium</p>
                  <p className="text-xs text-gray-400">
                    Get unlimited questions and advanced features
                  </p>
                </div>
              )}
            </div>

            <div className="card-hover p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
              <QuickActions />
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="border-b border-dark-muted mb-6">
              <nav className="-mb-px flex space-x-8" role="tablist" aria-label="Dashboard sections">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`${tab.id}-panel`}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-dark-neon-blue focus:ring-offset-2 focus:ring-offset-dark-primary ${
                        activeTab === tab.id
                          ? 'border-dark-neon-blue text-dark-neon-blue'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {activeTab === 'overview' && (
              <div id="overview-panel" role="tabpanel" aria-labelledby="overview-tab" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SubjectProgress />
                  <RecentActivity />
                </div>
              </div>
            )}

            {activeTab === 'assistant' && (
              <div id="assistant-panel" role="tabpanel" aria-labelledby="assistant-tab">
                <AIAssistant />
              </div>
            )}

            {activeTab === 'progress' && (
              <div id="progress-panel" role="tabpanel" aria-labelledby="progress-tab" className="card-hover p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-6 text-white">Detailed Progress</h3>
                <SubjectProgress detailed />
              </div>
            )}

            {activeTab === 'activity' && (
              <div id="activity-panel" role="tabpanel" aria-labelledby="activity-tab" className="card-hover p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-6 text-white">Recent Activity</h3>
                <RecentActivity detailed />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
