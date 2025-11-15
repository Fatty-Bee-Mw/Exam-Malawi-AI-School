import React from 'react';
import { useUserStats } from '../contexts/UserStatsContext';
import { 
  BeakerIcon,
  GlobeAltIcon,
  CalculatorIcon,
  LanguageIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function SubjectProgress({ detailed = false }) {
  const { subjects: userSubjects } = useUserStats();

  // Icon mapping for subjects
  const iconMap = {
    'Mathematics': CalculatorIcon,
    'Science': BeakerIcon,
    'English': LanguageIcon,
    'Social Studies': GlobeAltIcon,
    'Geography': GlobeAltIcon,
    'Biology': BeakerIcon,
    'Chemistry': BeakerIcon,
    'Physics': BeakerIcon,
  };

  // Color mapping for subjects
  const colorMap = {
    'Mathematics': 'blue',
    'Science': 'purple',
    'English': 'green',
    'Social Studies': 'pink',
    'Geography': 'blue',
    'Biology': 'green',
    'Chemistry': 'purple',
    'Physics': 'blue',
  };

  // Format subjects with progress data
  const subjects = userSubjects.map(subject => {
    const completed = subject.completedTopics?.length || 0;
    const total = subject.totalTopics || 30;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Format last studied
    let lastStudied = 'Never';
    if (subject.lastStudied) {
      const lastDate = new Date(subject.lastStudied);
      const today = new Date();
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) lastStudied = 'Today';
      else if (diffDays === 1) lastStudied = 'Yesterday';
      else lastStudied = `${diffDays} days ago`;
    }

    return {
      name: subject.name,
      icon: iconMap[subject.name] || BookOpenIcon,
      color: colorMap[subject.name] || 'blue',
      progress,
      topics: total,
      completed,
      lastStudied
    };
  });

  const colorClasses = {
    blue: 'from-dark-neon-blue to-cyan-500',
    purple: 'from-dark-neon-purple to-pink-500',
    green: 'from-dark-neon-green to-emerald-500',
    pink: 'from-dark-neon-pink to-rose-500'
  };

  const bgClasses = {
    blue: 'bg-dark-neon-blue/20 text-dark-neon-blue',
    purple: 'bg-dark-neon-purple/20 text-dark-neon-purple',
    green: 'bg-dark-neon-green/20 text-dark-neon-green',
    pink: 'bg-dark-neon-pink/20 text-dark-neon-pink'
  };

  const displaySubjects = detailed ? subjects : subjects.slice(0, 3);

  // Empty state
  if (subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No subjects yet</h3>
        <p className="text-gray-400 text-sm">
          Start asking questions or taking exams to track your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displaySubjects.map((subject, index) => {
        const Icon = subject.icon;
        return (
          <div key={index} className="p-4 rounded-lg border border-dark-muted hover:border-dark-neon-blue/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg ${bgClasses[subject.color]} flex items-center justify-center mr-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{subject.name}</h4>
                  <p className="text-xs text-gray-400">
                    {subject.completed}/{subject.topics} topics completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{subject.progress}%</p>
                <p className="text-xs text-gray-400">{subject.lastStudied}</p>
              </div>
            </div>
            <div className="w-full bg-dark-muted rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${colorClasses[subject.color]} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${subject.progress}%` }}
              ></div>
            </div>
          </div>
        );
      })}
      
      {!detailed && subjects.length > 3 && (
        <button className="w-full text-center text-sm text-dark-neon-blue hover:text-dark-neon-blue/80 transition-colors py-2">
          View all subjects →
        </button>
      )}
    </div>
  );
}
