import React from 'react';
import { useUserStats } from '../contexts/UserStatsContext';
import { 
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

export default function RecentActivity({ detailed = false }) {
  const { activities: userActivities } = useUserStats();

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffTime = Math.abs(now - activityDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Format activities
  const activities = userActivities.map((activity, index) => {
    const baseActivity = {
      id: index,
      timestamp: activity.timestamp,
      time: formatTimeAgo(activity.timestamp),
    };

    if (activity.type === 'question') {
      return {
        ...baseActivity,
        type: 'question',
        title: activity.topic ? `Asked about ${activity.topic}` : 'Asked a question',
        subject: activity.subject || 'General',
        icon: BookOpenIcon,
        color: 'blue'
      };
    } else if (activity.type === 'exam') {
      return {
        ...baseActivity,
        type: 'exam',
        title: `Completed ${activity.subject} Exam`,
        subject: activity.subject || 'General',
        score: activity.score ? `${activity.score}%` : undefined,
        icon: AcademicCapIcon,
        color: 'purple'
      };
    }

    return baseActivity;
  });

  const colorClasses = {
    blue: 'text-dark-neon-blue bg-dark-neon-blue/20',
    purple: 'text-dark-neon-purple bg-dark-neon-purple/20',
    green: 'text-dark-neon-green bg-dark-neon-green/20'
  };

  const displayActivities = detailed ? activities : activities.slice(0, 3);

  // Empty state
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <InboxIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No activity yet</h3>
        <p className="text-gray-400 text-sm">
          Your learning activities will appear here as you use the AI Assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-dark-accent/50 transition-colors">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[activity.color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {activity.title}
              </p>
              <div className="flex items-center mt-1 text-xs text-gray-400">
                <span>{activity.subject}</span>
                {activity.score && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-dark-neon-green">{activity.score}</span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      
      {!detailed && activities.length > 3 && (
        <button className="w-full text-center text-sm text-dark-neon-blue hover:text-dark-neon-blue/80 transition-colors py-2">
          View all activity →
        </button>
      )}
    </div>
  );
}
