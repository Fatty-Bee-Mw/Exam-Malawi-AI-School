import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { PLAN_LIMITS, FREE_TRIAL_DAYS, getPlanKey } from '../constants/limits';

const UserLimitsContext = createContext();

export function useUserLimits() {
  return useContext(UserLimitsContext);
}

export function UserLimitsProvider({ children }) {
  const { currentUser } = useAuth();
  const [usage, setUsage] = useState({
    questionsAsked: 0,
    examsGenerated: 0,
    lastReset: new Date().toDateString(),
    signupDate: null,
    daysOfFreeUse: 0
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
      ...PLAN_LIMITS.free,
      features: ['basic questions', 'limited subjects'],
    },
    freeExtended: {
      ...PLAN_LIMITS.freeExtended,
      features: ['basic questions', 'limited subjects'],
    },
    premium: {
      ...PLAN_LIMITS.premium,
      features: ['unlimited questions', 'all subjects', 'advanced analytics', 'pdf export'],
    },
  };

  const currentPlan = getPlanKey(
    currentUser?.isPremium,
    usage.daysOfFreeUse,
    currentUser?.subscription
  );
  const currentLimits = limits[currentPlan];

  useEffect(() => {
    if (currentUser) {
      try {
        const storedUsage = safeLocalStorage.getItem(`usage_${currentUser.id}`);
        if (storedUsage) {
          const parsedUsage = JSON.parse(storedUsage);
          
          // Calculate days of free use
          const signupDate = parsedUsage.signupDate ? new Date(parsedUsage.signupDate) : new Date();
          const daysSinceSignup = Math.floor((new Date() - signupDate) / (1000 * 60 * 60 * 24));
          
          if (parsedUsage.lastReset !== new Date().toDateString()) {
            const resetUsage = {
              questionsAsked: 0,
              examsGenerated: 0,
              lastReset: new Date().toDateString(),
              signupDate: parsedUsage.signupDate || new Date().toISOString(),
              daysOfFreeUse: daysSinceSignup
            };
            setUsage(resetUsage);
            safeLocalStorage.setItem(`usage_${currentUser.id}`, JSON.stringify(resetUsage));
          } else {
            setUsage({
              ...parsedUsage,
              daysOfFreeUse: daysSinceSignup
            });
          }
        } else {
          // First time user - set signup date
          const initialUsage = {
            questionsAsked: 0,
            examsGenerated: 0,
            lastReset: new Date().toDateString(),
            signupDate: new Date().toISOString(),
            daysOfFreeUse: 0
          };
          setUsage(initialUsage);
          safeLocalStorage.setItem(`usage_${currentUser.id}`, JSON.stringify(initialUsage));
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
    updateUsage,
    shouldShowUpgradeNotification: currentPlan !== 'premium' && usage.daysOfFreeUse >= FREE_TRIAL_DAYS - 2,
    daysUntilLimit: Math.max(0, FREE_TRIAL_DAYS - usage.daysOfFreeUse)
  };

  return (
    <UserLimitsContext.Provider value={value}>
      {children}
    </UserLimitsContext.Provider>
  );
}
