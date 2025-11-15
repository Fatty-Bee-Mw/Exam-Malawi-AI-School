import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserLimitsContext = createContext();

export function useUserLimits() {
  return useContext(UserLimitsContext);
}

export function UserLimitsProvider({ children }) {
  const { currentUser } = useAuth();
  const [usage, setUsage] = useState({
    questionsAsked: 0,
    examsGenerated: 0,
    lastReset: new Date().toDateString()
  });

  // Safe localStorage wrapper
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage getItem error:', error);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error('localStorage setItem error:', error);
        return false;
      }
    }
  };

  const limits = {
    free: {
      questionsPerDay: 10,
      examsPerDay: 3,
      features: ['basic questions', 'limited subjects']
    },
    premium: {
      questionsPerDay: 100,
      examsPerDay: 20,
      features: ['unlimited questions', 'all subjects', 'advanced analytics', 'pdf export']
    }
  };

  const currentPlan = currentUser?.isPremium ? 'premium' : 'free';
  const currentLimits = limits[currentPlan];

  useEffect(() => {
    if (currentUser) {
      try {
        const storedUsage = safeLocalStorage.getItem(`usage_${currentUser.id}`);
        if (storedUsage) {
          const parsedUsage = JSON.parse(storedUsage);
          if (parsedUsage.lastReset !== new Date().toDateString()) {
            const resetUsage = {
              questionsAsked: 0,
              examsGenerated: 0,
              lastReset: new Date().toDateString()
            };
            setUsage(resetUsage);
            safeLocalStorage.setItem(`usage_${currentUser.id}`, JSON.stringify(resetUsage));
          } else {
            setUsage(parsedUsage);
          }
        }
      } catch (error) {
        console.error('Error loading user usage:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const updateUsage = (type) => {
    try {
      const newUsage = { ...usage };
      if (type === 'question') {
        newUsage.questionsAsked += 1;
      } else if (type === 'exam') {
        newUsage.examsGenerated += 1;
      }
      newUsage.lastReset = new Date().toDateString();
      
      setUsage(newUsage);
      if (currentUser) {
        safeLocalStorage.setItem(`usage_${currentUser.id}`, JSON.stringify(newUsage));
      }
    } catch (error) {
      console.error('Error updating usage:', error);
    }
  };

  const canAskQuestion = () => {
    return usage.questionsAsked < currentLimits.questionsPerDay;
  };

  const canGenerateExam = () => {
    return usage.examsGenerated < currentLimits.examsPerDay;
  };

  const getRemainingQuestions = () => {
    return Math.max(0, currentLimits.questionsPerDay - usage.questionsAsked);
  };

  const getRemainingExams = () => {
    return Math.max(0, currentLimits.examsPerDay - usage.examsGenerated);
  };

  const value = {
    usage,
    limits: currentLimits,
    currentPlan,
    canAskQuestion,
    canGenerateExam,
    getRemainingQuestions,
    getRemainingExams,
    updateUsage
  };

  return (
    <UserLimitsContext.Provider value={value}>
      {children}
    </UserLimitsContext.Provider>
  );
}
