import React, { createContext, useState, useContext, useEffect } from 'react';
import storage from '../utils/storage';

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    totalQuestions: 0,
    totalExams: 0,
    modelPerformance: {
      averageResponseTime: 0,
      successRate: 100,
      totalRequests: 0,
      errorCount: 0,
    },
    subjectUsage: {},
    userActivity: [],
    systemHealth: {
      modelStatus: 'unknown',
      lastModelUpdate: null,
      datasetSize: 0,
    }
  });

  const [trainingStatus, setTrainingStatus] = useState({
    isTraining: false,
    progress: 0,
    currentFile: '',
    totalFiles: 0,
    processedFiles: 0,
    errors: [],
    startTime: null,
  });

  // Load admin stats from storage
  useEffect(() => {
    const savedStats = storage.getJSON('adminStats', adminStats);
    setAdminStats(savedStats);
  }, []);

  // Save stats whenever they change
  const saveStats = (newStats) => {
    storage.setJSON('adminStats', newStats);
    setAdminStats(newStats);
  };

  // Update user registration stats
  const recordUserRegistration = (isPremium = false) => {
    const newStats = {
      ...adminStats,
      totalUsers: adminStats.totalUsers + 1,
      freeUsers: isPremium ? adminStats.freeUsers : adminStats.freeUsers + 1,
      premiumUsers: isPremium ? adminStats.premiumUsers + 1 : adminStats.premiumUsers,
    };
    saveStats(newStats);
  };

  // Record user upgrade to premium
  const recordPremiumUpgrade = () => {
    const newStats = {
      ...adminStats,
      freeUsers: Math.max(0, adminStats.freeUsers - 1),
      premiumUsers: adminStats.premiumUsers + 1,
    };
    saveStats(newStats);
  };

  // Record AI interaction
  const recordAIInteraction = (type, subject, responseTime, success = true) => {
    const newStats = { ...adminStats };
    
    // Update totals
    if (type === 'question') {
      newStats.totalQuestions += 1;
    } else if (type === 'exam') {
      newStats.totalExams += 1;
    }

    // Update model performance
    const performance = newStats.modelPerformance;
    performance.totalRequests += 1;
    
    if (success) {
      // Update average response time
      const totalTime = performance.averageResponseTime * (performance.totalRequests - 1) + responseTime;
      performance.averageResponseTime = Math.round(totalTime / performance.totalRequests);
    } else {
      performance.errorCount += 1;
    }
    
    performance.successRate = Math.round(((performance.totalRequests - performance.errorCount) / performance.totalRequests) * 100);

    // Update subject usage
    if (subject) {
      newStats.subjectUsage[subject] = (newStats.subjectUsage[subject] || 0) + 1;
    }

    // Add to user activity log
    newStats.userActivity.unshift({
      type,
      subject,
      timestamp: new Date().toISOString(),
      responseTime,
      success,
    });

    // Keep only last 100 activities
    newStats.userActivity = newStats.userActivity.slice(0, 100);

    saveStats(newStats);
  };

  // Get most popular subjects
  const getMostPopularSubjects = () => {
    const subjects = Object.entries(adminStats.subjectUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    return subjects;
  };

  // Get user tier distribution
  const getUserTierDistribution = () => {
    const total = adminStats.totalUsers;
    if (total === 0) return { free: 0, premium: 0 };
    
    return {
      free: Math.round((adminStats.freeUsers / total) * 100),
      premium: Math.round((adminStats.premiumUsers / total) * 100),
    };
  };

  // Get recent activity
  const getRecentActivity = (limit = 20) => {
    return adminStats.userActivity.slice(0, limit);
  };

  // Start training process
  const startTraining = async (files) => {
    setTrainingStatus({
      isTraining: true,
      progress: 0,
      currentFile: '',
      totalFiles: files.length,
      processedFiles: 0,
      errors: [],
      startTime: new Date().toISOString(),
    });

    try {
      // Simulate training process with multithreading
      await processTrainingFiles(files);
    } catch (error) {
      console.error('Training failed:', error);
      setTrainingStatus(prev => ({
        ...prev,
        isTraining: false,
        errors: [...prev.errors, error.message],
      }));
    }
  };

  // Process training files (simulated multithreading)
  const processTrainingFiles = async (files) => {
    const batchSize = 3; // Process 3 files at a time
    const batches = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      // Process batch in parallel
      const batchPromises = batch.map(async (file, fileIndex) => {
        const globalIndex = batchIndex * batchSize + fileIndex;
        
        setTrainingStatus(prev => ({
          ...prev,
          currentFile: file.name,
          progress: Math.round((globalIndex / files.length) * 100),
        }));

        try {
          // Simulate file processing
          await simulateFileProcessing(file);
          
          setTrainingStatus(prev => ({
            ...prev,
            processedFiles: prev.processedFiles + 1,
          }));
        } catch (error) {
          setTrainingStatus(prev => ({
            ...prev,
            errors: [...prev.errors, `Error processing ${file.name}: ${error.message}`],
          }));
        }
      });

      await Promise.all(batchPromises);
    }

    // Training complete
    setTrainingStatus(prev => ({
      ...prev,
      isTraining: false,
      progress: 100,
      currentFile: 'Training completed!',
    }));

    // Update system health
    const newStats = {
      ...adminStats,
      systemHealth: {
        ...adminStats.systemHealth,
        lastModelUpdate: new Date().toISOString(),
        datasetSize: adminStats.systemHealth.datasetSize + files.length,
      }
    };
    saveStats(newStats);
  };

  // Simulate file processing with data cleaning
  const simulateFileProcessing = async (file) => {
    // Simulate processing time based on file size
    const processingTime = Math.min(2000, Math.max(500, file.size / 1000));
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate occasional errors
        if (Math.random() < 0.05) { // 5% error rate
          reject(new Error('File format not supported or corrupted'));
        } else {
          resolve();
        }
      }, processingTime);
    });
  };

  // Reset training status
  const resetTraining = () => {
    setTrainingStatus({
      isTraining: false,
      progress: 0,
      currentFile: '',
      totalFiles: 0,
      processedFiles: 0,
      errors: [],
      startTime: null,
    });
  };

  // Update model status
  const updateModelStatus = (status) => {
    const newStats = {
      ...adminStats,
      systemHealth: {
        ...adminStats.systemHealth,
        modelStatus: status,
      }
    };
    saveStats(newStats);
  };

  // Reset all stats (for testing)
  const resetAllStats = () => {
    const emptyStats = {
      totalUsers: 0,
      freeUsers: 0,
      premiumUsers: 0,
      totalQuestions: 0,
      totalExams: 0,
      modelPerformance: {
        averageResponseTime: 0,
        successRate: 100,
        totalRequests: 0,
        errorCount: 0,
      },
      subjectUsage: {},
      userActivity: [],
      systemHealth: {
        modelStatus: 'unknown',
        lastModelUpdate: null,
        datasetSize: 0,
      }
    };
    saveStats(emptyStats);
  };

  const value = {
    adminStats,
    trainingStatus,
    recordUserRegistration,
    recordPremiumUpgrade,
    recordAIInteraction,
    getMostPopularSubjects,
    getUserTierDistribution,
    getRecentActivity,
    startTraining,
    resetTraining,
    updateModelStatus,
    resetAllStats,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
