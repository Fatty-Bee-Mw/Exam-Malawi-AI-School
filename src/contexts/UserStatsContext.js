import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import storage from '../utils/storage';

const UserStatsContext = createContext();

export function useUserStats() {
  return useContext(UserStatsContext);
}

export function UserStatsProvider({ children }) {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    examsCompleted: 0,
    totalScore: 0,
    scoreCount: 0,
    lastStudyDate: null,
    studyDates: [],
  });

  const [subjects, setSubjects] = useState([]);
  const [activities, setActivities] = useState([]);

  // Load user stats from storage
  useEffect(() => {
    if (currentUser) {
      const savedStats = storage.getJSON(`stats_${currentUser.id}`, {
        questionsAnswered: 0,
        examsCompleted: 0,
        totalScore: 0,
        scoreCount: 0,
        lastStudyDate: null,
        studyDates: [],
      });

      const savedSubjects = storage.getJSON(`subjects_${currentUser.id}`, []);
      const savedActivities = storage.getJSON(`activities_${currentUser.id}`, []);

      setStats(savedStats);
      setSubjects(savedSubjects);
      setActivities(savedActivities);
    }
  }, [currentUser]);

  // Save stats whenever they change
  const saveStats = (newStats) => {
    if (currentUser) {
      storage.setJSON(`stats_${currentUser.id}`, newStats);
      setStats(newStats);
    }
  };

  // Record a question answered
  const recordQuestion = (subject, topic) => {
    const newStats = {
      ...stats,
      questionsAnswered: stats.questionsAnswered + 1,
      lastStudyDate: new Date().toISOString(),
      studyDates: [...new Set([...stats.studyDates, new Date().toDateString()])],
    };
    saveStats(newStats);

    // Update subject progress
    updateSubjectProgress(subject, topic);

    // Add to recent activity
    addActivity({
      type: 'question',
      subject,
      topic,
      timestamp: new Date().toISOString(),
    });
  };

  // Record an exam completed
  const recordExam = (subject, score) => {
    const newStats = {
      ...stats,
      examsCompleted: stats.examsCompleted + 1,
      totalScore: stats.totalScore + score,
      scoreCount: stats.scoreCount + 1,
      lastStudyDate: new Date().toISOString(),
      studyDates: [...new Set([...stats.studyDates, new Date().toDateString()])],
    };
    saveStats(newStats);

    // Add to recent activity
    addActivity({
      type: 'exam',
      subject,
      score,
      timestamp: new Date().toISOString(),
    });
  };

  // Update subject progress
  const updateSubjectProgress = (subjectName, topic) => {
    const existingSubject = subjects.find(s => s.name === subjectName);
    
    let updatedSubjects;
    if (existingSubject) {
      updatedSubjects = subjects.map(s => {
        if (s.name === subjectName) {
          const completedTopics = new Set(s.completedTopics || []);
          completedTopics.add(topic);
          return {
            ...s,
            completedTopics: Array.from(completedTopics),
            lastStudied: new Date().toISOString(),
          };
        }
        return s;
      });
    } else {
      // Add new subject
      updatedSubjects = [
        ...subjects,
        {
          name: subjectName,
          completedTopics: [topic],
          totalTopics: 30, // Default, can be updated
          lastStudied: new Date().toISOString(),
        },
      ];
    }

    setSubjects(updatedSubjects);
    if (currentUser) {
      storage.setJSON(`subjects_${currentUser.id}`, updatedSubjects);
    }
  };

  // Add activity to recent activities
  const addActivity = (activity) => {
    const newActivities = [activity, ...activities].slice(0, 20); // Keep last 20
    setActivities(newActivities);
    if (currentUser) {
      storage.setJSON(`activities_${currentUser.id}`, newActivities);
    }
  };

  // Calculate average score
  const getAverageScore = () => {
    if (stats.scoreCount === 0) return 0;
    return Math.round(stats.totalScore / stats.scoreCount);
  };

  // Calculate study streak
  const getStudyStreak = () => {
    if (stats.studyDates.length === 0) return 0;

    const sortedDates = stats.studyDates
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const studyDate of sortedDates) {
      studyDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate - studyDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  // Reset stats (for testing or new start)
  const resetStats = () => {
    const emptyStats = {
      questionsAnswered: 0,
      examsCompleted: 0,
      totalScore: 0,
      scoreCount: 0,
      lastStudyDate: null,
      studyDates: [],
    };
    saveStats(emptyStats);
    setSubjects([]);
    setActivities([]);
    if (currentUser) {
      storage.setJSON(`subjects_${currentUser.id}`, []);
      storage.setJSON(`activities_${currentUser.id}`, []);
    }
  };

  const value = {
    stats,
    subjects,
    activities,
    recordQuestion,
    recordExam,
    updateSubjectProgress,
    getAverageScore,
    getStudyStreak,
    resetStats,
  };

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
}
