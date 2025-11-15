import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';
import TextPasteTraining from './TextPasteTraining';
import ConnectionStatus from './ConnectionStatus';
import useLiveTracking from '../hooks/useLiveTracking';
import { 
  UsersIcon,
  ChartBarIcon,
  CpuChipIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FolderOpenIcon,
  TrashIcon,
  ArrowPathIcon,
  StopIcon,
  ChartPieIcon,
  ServerIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  // ALL HOOKS MUST BE AT THE TOP - Rules of Hooks
  const adminContext = useAdmin();
  const authContext = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    totalQuestions: 0,
    totalExams: 0,
    averageScore: 0,
    modelPerformance: {
      responseTime: 0,
      accuracy: 0,
      uptime: 0
    },
    subjectUsage: {},
    userActivity: [],
    systemHealth: {
      modelStatus: 'Unknown',
      lastModelUpdate: null,
      datasetSize: 0
    }
  });
  const [trainingStatus] = useState({ isTraining: false, progress: 0, errors: [] });
  const [realTimeTrainingStatus, setRealTimeTrainingStatus] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trainingDataList, setTrainingDataList] = useState([]);
  const [selectedDataFiles, setSelectedDataFiles] = useState([]);
  const [storageStats, setStorageStats] = useState(null);
  const fileInputRef = useRef(null);

  // Context destructuring with safe defaults
  const { currentUser = null } = authContext || {};

  // Check if user is admin (simple check - in production use proper auth)
  const isUserAdmin = currentUser?.email === 'ylikagwa@gmail.com' || currentUser?.name?.toLowerCase().includes('admin');

  // Use live tracking hook for real-time data
  const liveTracking = useLiveTracking(isUserAdmin, 5000);

  // Fetch real-time data from backend
  const fetchData = useCallback(async () => {
    if (!isUserAdmin) return;
    
    try {
        // Use individual try-catch for each API call to prevent one failure from breaking everything
        let trainingStatus = { is_training: false, progress: 0 };
        // modelData and healthData are fetched but not currently used
        let modelData = { model_exists: false };
        let healthData = { status: 'unknown' };
        let trainingData = { data: [] };
        let storage = { stats: {} };

        try {
          trainingStatus = await adminService.getTrainingStatus();
        } catch (e) {
          console.warn('Failed to get training status:', e);
        }

        try {
          modelData = await adminService.getModelInfo();
        } catch (e) {
          console.warn('Failed to get model info:', e);
        }

        try {
          const healthResponse = await adminService.getSystemHealth();
          healthData = healthResponse.success ? healthResponse.data : { status: 'unknown' };
        } catch (e) {
          console.warn('Failed to get system health:', e);
        }

        // Get live stats for better real-time data
        try {
          const liveStatsResponse = await adminService.getLiveStats();
          if (liveStatsResponse.success) {
            const liveData = liveStatsResponse.data;
            // Merge live data with existing data
            Object.assign(healthData, liveData);
          }
        } catch (e) {
          console.warn('Failed to get live stats:', e);
        }

        try {
          trainingData = await adminService.getTrainingDataList();
        } catch (e) {
          console.warn('Failed to get training data:', e);
        }

        try {
          storage = await adminService.getStorageStats();
        } catch (e) {
          console.warn('Failed to get storage stats:', e);
        }

        setRealTimeTrainingStatus(trainingStatus);
        setTrainingDataList(trainingData.data || []);
        setStorageStats(storage.stats || {});
        
        // Set real admin stats from API responses
        const realStats = {
          totalUsers: healthData.totalUsers || 0,
          freeUsers: healthData.freeUsers || 0,
          premiumUsers: healthData.premiumUsers || 0,
          totalQuestions: healthData.totalQuestions || 0,
          totalExams: healthData.totalExams || 0,
          averageScore: healthData.averageScore || 0,
          modelPerformance: {
            responseTime: modelData.averageResponseTime || 0,
            accuracy: modelData.successRate || 0,
            uptime: healthData.uptime || 0
          },
          subjectUsage: healthData.subjectUsage || {},
          userActivity: healthData.userActivity || [],
          systemHealth: {
            modelStatus: healthData.status || 'Unknown',
            lastModelUpdate: modelData.lastUpdate || new Date().toISOString(),
            datasetSize: trainingData.totalSize || 0
          },
          modelInfo: {
            model_name: modelData.model_name || 'Unknown Model',
            model_type: modelData.model_type || 'Unknown',
            device: modelData.device || 'Unknown',
            is_custom_model: modelData.is_custom_model || false,
            tokenizer_vocab_size: modelData.tokenizer_vocab_size || 0,
            model_path: modelData.model_path || 'Unknown'
          }
        };
        
        setAdminStats(realStats);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        // Set default data even if API calls fail
        setAdminStats({
          totalUsers: 0,
          freeUsers: 0,
          premiumUsers: 0,
          totalQuestions: 0,
          totalExams: 0,
          averageScore: 0,
          modelPerformance: {
            responseTime: 0,
            accuracy: 0,
            uptime: 0
          },
          subjectUsage: {},
          userActivity: [],
          systemHealth: {
            modelStatus: 'Unknown',
            lastModelUpdate: new Date().toISOString(),
            datasetSize: 0
          }
        });
        setLoading(false);
      }
    }, [isUserAdmin]);

  // useEffect for initial data fetch and polling
  useEffect(() => {
    if (!isUserAdmin) return;

    fetchData();

    // Set up polling for training status
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [isUserAdmin, fetchData]);

  // Early return after all hooks
  if (!adminContext || !authContext) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-neon-blue mx-auto mb-4"></div>
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center p-4">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dark-neon-blue mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Loading Admin Dashboard</h1>
          <p className="text-gray-400">Fetching system data and statistics...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'performance', label: 'Model Performance', icon: CpuChipIcon },
    { id: 'training', label: 'Model Training', icon: DocumentTextIcon },
    { id: 'data', label: 'Training Data', icon: CloudArrowUpIcon },
    { id: 'system', label: 'System Health', icon: ServerIcon },
  ];

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validation = adminService.validateFiles(files);
    if (!validation.isValid) {
      alert(`File validation failed:\n${validation.errors.join('\n')}`);
      return;
    }

    setSelectedFiles(files);
    
    try {
      setUploadProgress(20);
      
      // Upload files using FormData
      const response = await adminService.uploadFiles(files);
      
      setUploadProgress(80);
      
      if (response.success) {
        setUploadProgress(100);
        
        alert(`Files uploaded successfully!\nUploaded: ${files.length} files\nTotal size: ${adminService.formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}\n\nFiles are now available for training.`);
        
        // Refresh data to show new files
        await fetchData();
        setSelectedFiles([]);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert(`Upload failed: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. Files are valid format\n3. Network connection`);
    } finally {
      setUploadProgress(0);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  const handleStartTraining = async () => {
    try {
      if (trainingDataList.length === 0) {
        alert('No training files available. Please upload files first.');
        return;
      }

      const confirmStart = window.confirm(
        `Start training with ${trainingDataList.length} files?\n\nThis will use all uploaded training data to improve the model.`
      );

      if (!confirmStart) return;

      // Convert training data list to the format expected by the API
      const filesData = trainingDataList.map(file => ({
        name: file.original_filename,
        content: file.content || '', // This might need to be fetched separately
        size: file.file_size,
      }));

      const result = await adminService.startTraining(filesData);
      
      if (result.success) {
        alert('Training started successfully! Monitor progress in the training status section.');
        await fetchData(); // Refresh to show training status
      } else {
        alert(`Failed to start training: ${result.error}`);
      }
    } catch (error) {
      console.error('Start training failed:', error);
      alert(`Failed to start training: ${error.message}`);
    }
  };

  const handleStopTraining = async () => {
    try {
      const result = await adminService.stopTraining();
      if (result.success) {
        alert('Training stopped successfully!');
      } else {
        alert(`Failed to stop training: ${result.error}`);
      }
    } catch (error) {
      console.error('Stop training failed:', error);
      alert(`Failed to stop training: ${error.message}`);
    }
  };

  const handleDeleteSelectedData = async () => {
    if (selectedDataFiles.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedDataFiles.length} selected training files? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const response = await adminService.deleteTrainingData(selectedDataFiles);
      
      if (response.success) {
        // Refresh data lists
        await fetchData();
        setSelectedDataFiles([]);
        
        alert(`Successfully deleted ${response.deleted_count} files.`);
      } else {
        alert(`Error deleting files: ${response.error}`);
      }
    } catch (error) {
      console.error('Error deleting training data:', error);
      alert('Failed to delete training data. Please try again.');
    }
  };

  const handleTextPasteSubmit = async (textData) => {
    try {
      setUploadProgress(10);
      
      setUploadProgress(50);

      // Submit to training API
      const response = await adminService.uploadTextContent(textData);
      
      setUploadProgress(100);

      if (response.success) {
        alert(`Text content added to training successfully!\nContent: ${textData.wordCount} words\nType: ${textData.contentType}`);
        
        // Refresh training status and data
        await fetchData();
      } else {
        alert(`Error adding text content: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting pasted text:', error);
      alert('Failed to add text content to training. Please try again.');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleSelectDataFile = (fileId) => {
    setSelectedDataFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  // Mock functions for system actions
  const updateModelStatus = (status) => {
    console.log(`Model status updated to: ${status}`);
    alert(`Model status updated to: ${status}`);
    // In a real app, this would call an API
  };

  const resetAllStats = () => {
    const confirmReset = window.confirm('Are you sure you want to reset all statistics? This action cannot be undone.');
    if (confirmReset) {
      console.log('All statistics reset');
      alert('All statistics have been reset');
      // In a real app, this would call an API and refresh data
      fetchData();
    }
  };

  const handleSelectAllDataFiles = () => {
    if (!Array.isArray(trainingDataList)) return;
    
    if (selectedDataFiles.length === trainingDataList.length) {
      setSelectedDataFiles([]);
    } else {
      setSelectedDataFiles(trainingDataList.map(file => file.id));
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="card-hover p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`text-${trend.positive ? 'green' : 'red'}-400`}>
            {trend.value}
          </span>
          <span className="text-gray-400 ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );

  // Calculate real data from adminStats
  const tierDistribution = {
    free: adminStats?.totalUsers > 0 ? Math.round((adminStats.freeUsers / adminStats.totalUsers) * 100) : 0,
    premium: adminStats?.totalUsers > 0 ? Math.round((adminStats.premiumUsers / adminStats.totalUsers) * 100) : 0
  };
  
  // Real popular subjects will come from backend analytics
  const popularSubjects = adminStats?.subjectUsage ? 
    Object.entries(adminStats.subjectUsage).map(([subject, usage]) => ({
      subject,
      usage: Math.round(usage)
    })).sort((a, b) => b.usage - a.usage).slice(0, 4) : [];
  
  // Real recent activity will come from backend user activity logs
  const recentActivity = adminStats?.userActivity || [];

  // Helper function to safely format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold neon-text mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">
                Monitor system performance, user analytics, and manage AI model training
              </p>
              {/* Model Info Display */}
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CpuChipIcon className="h-4 w-4 text-dark-neon-blue" />
                  <span className="text-sm text-gray-300">
                    Model: <span className="text-dark-neon-blue font-semibold">
                      {adminStats?.modelInfo?.model_name || 'Loading...'}
                    </span>
                  </span>
                </div>
                {adminStats?.modelInfo?.device && (
                  <div className="flex items-center space-x-2">
                    <ServerIcon className="h-4 w-4 text-dark-neon-green" />
                    <span className="text-sm text-gray-300">
                      Device: <span className="text-dark-neon-green font-semibold">
                        {adminStats.modelInfo.device.toUpperCase()}
                      </span>
                    </span>
                  </div>
                )}
                {adminStats?.modelInfo?.is_custom_model !== undefined && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    adminStats.modelInfo.is_custom_model 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {adminStats.modelInfo.is_custom_model ? 'Custom Model' : 'Fallback Model'}
                  </div>
                )}
              </div>
            </div>
            <ConnectionStatus
              status={liveTracking.connectionStatus}
              lastUpdate={liveTracking.lastUpdate}
              onRefresh={liveTracking.refresh}
              className="hidden md:flex"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-dark-muted mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-dark-neon-blue text-dark-neon-blue'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={adminStats?.totalUsers || 0}
                icon={UsersIcon}
                color="blue"
                subtitle={`${adminStats?.freeUsers || 0} free, ${adminStats?.premiumUsers || 0} premium`}
              />
              <StatCard
                title="Total Questions"
                value={adminStats?.totalQuestions || 0}
                icon={AcademicCapIcon}
                color="green"
              />
              <StatCard
                title="Total Exams"
                value={adminStats?.totalExams || 0}
                icon={DocumentTextIcon}
                color="purple"
              />
              <StatCard
                title="Model Success Rate"
                value={`${adminStats?.modelPerformance?.successRate || 0}%`}
                icon={CpuChipIcon}
                color="pink"
                subtitle={`${adminStats?.modelPerformance?.totalRequests || 0} total requests`}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Tier Distribution */}
              <div className="card-hover p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-dark-neon-blue" />
                  User Tier Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Free Users</span>
                    <span className="text-white font-semibold">{tierDistribution.free}%</span>
                  </div>
                  <div className="w-full bg-dark-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-dark-neon-blue to-cyan-500 h-3 rounded-full"
                      style={{ width: `${tierDistribution.free}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Premium Users</span>
                    <span className="text-white font-semibold">{tierDistribution.premium}%</span>
                  </div>
                  <div className="w-full bg-dark-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-dark-neon-purple to-pink-500 h-3 rounded-full"
                      style={{ width: `${tierDistribution.premium}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Popular Subjects */}
              <div className="card-hover p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-dark-neon-green" />
                  Most Popular Subjects
                </h3>
                <div className="space-y-3">
                  {Array.isArray(popularSubjects) && popularSubjects.length > 0 ? (
                    popularSubjects.map((subjectData, index) => (
                      <div key={subjectData.subject} className="flex items-center justify-between">
                        <span className="text-gray-300">{subjectData.subject}</span>
                        <div className="flex items-center">
                          <span className="text-white font-semibold mr-2">{subjectData.usage}%</span>
                          <div className="w-16 bg-dark-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-dark-neon-green to-green-500 h-2 rounded-full"
                              style={{ width: `${subjectData.usage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No subject data yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Registered Users"
                value={adminStats?.totalUsers || 0}
                icon={UsersIcon}
                color="blue"
              />
              <StatCard
                title="Free Tier Users"
                value={adminStats?.freeUsers || 0}
                icon={UsersIcon}
                color="green"
                subtitle={`${tierDistribution.free}% of total`}
              />
              <StatCard
                title="Premium Users"
                value={adminStats?.premiumUsers || 0}
                icon={UsersIcon}
                color="purple"
                subtitle={`${tierDistribution.premium}% of total`}
              />
            </div>

            {/* Recent User Activity */}
            <div className="card-hover p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Recent User Activity</h3>
              <div className="space-y-3">
                {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-accent/30 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          activity.type === 'question' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {activity.type === 'question' ? '❓' : '📝'}
                        </div>
                        <div>
                          <p className="text-white text-sm">
                            {activity.type === 'question' ? 'Question asked' : 'Exam completed'} 
                            {activity.subject && ` in ${activity.subject}`}
                          </p>
                          <p className="text-gray-400 text-xs">{formatTime(activity.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${activity.success ? 'text-green-400' : 'text-red-400'}`}>
                          {activity.success ? 'Success' : 'Failed'}
                        </p>
                        <p className="text-gray-400 text-xs">{activity.responseTime}ms</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No user activity yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Average Response Time"
                value={`${adminStats?.modelPerformance?.averageResponseTime || 0}ms`}
                icon={ClockIcon}
                color="blue"
              />
              <StatCard
                title="Success Rate"
                value={`${adminStats?.modelPerformance?.successRate || 0}%`}
                icon={CheckCircleIcon}
                color="green"
              />
              <StatCard
                title="Total Requests"
                value={adminStats?.modelPerformance?.totalRequests || 0}
                icon={CpuChipIcon}
                color="purple"
              />
              <StatCard
                title="Error Count"
                value={adminStats?.modelPerformance?.errorCount || 0}
                icon={ExclamationTriangleIcon}
                color="red"
              />
            </div>

            {/* Performance Details */}
            <div className="card-hover p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Model Performance Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Response Time Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Fast (&lt;1s)</span>
                      <span className="text-green-400">85%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Medium (1-3s)</span>
                      <span className="text-yellow-400">12%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Slow (&gt;3s)</span>
                      <span className="text-red-400">3%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Error Types</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Connection Errors</span>
                      <span className="text-red-400">60%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Model Errors</span>
                      <span className="text-red-400">30%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Timeout Errors</span>
                      <span className="text-red-400">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            {/* Training Controls */}
            <div className="card-hover p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-dark-neon-blue" />
                Model Training
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">📁 File Upload Training</h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleFileSelect}
                      disabled={realTimeTrainingStatus?.is_training || uploadProgress > 0}
                      className="w-full btn-primary text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FolderOpenIcon className="h-5 w-5 mr-2" />
                      {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Select Training Files'}
                    </button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept=".txt,.pdf,.doc,.docx,.csv,.xlsx,.xls,.json,.xml,.html,.htm,.md,.rtf"
                      className="hidden"
                    />
                    
                    {!realTimeTrainingStatus?.is_training && trainingDataList.length > 0 && (
                      <button
                        onClick={handleStartTraining}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                      >
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Start Training ({trainingDataList.length} files)
                      </button>
                    )}
                    
                    {realTimeTrainingStatus?.is_training && (
                      <button
                        onClick={handleStopTraining}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                      >
                        <StopIcon className="h-5 w-5 mr-2" />
                        Stop Training
                      </button>
                    )}
                    
                    {selectedFiles.length > 0 && (
                      <div className="text-xs text-gray-400">
                        Selected: {selectedFiles.length} files ({adminService.formatFileSize(selectedFiles.reduce((sum, f) => sum + f.size, 0))})
                        <br />
                        Estimated time: {adminService.estimateTrainingTime(selectedFiles)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Training Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Status</span>
                      <span className={`font-semibold ${realTimeTrainingStatus?.is_training ? 'text-yellow-400' : 'text-green-400'}`}>
                        {realTimeTrainingStatus?.is_training ? 'Training...' : 'Ready'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white">{realTimeTrainingStatus?.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-dark-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-dark-neon-blue to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${realTimeTrainingStatus?.progress || 0}%` }}
                      ></div>
                    </div>
                    {realTimeTrainingStatus?.current_file && (
                      <p className="text-xs text-gray-400 truncate">
                        Processing: {realTimeTrainingStatus.current_file}
                      </p>
                    )}
                    {realTimeTrainingStatus?.start_time && (
                      <p className="text-xs text-gray-400">
                        Running for: {adminService.formatTrainingTime(realTimeTrainingStatus.start_time)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Text Paste Training */}
            <div className="card-hover p-6 rounded-xl">
              <TextPasteTraining 
                onTextSubmit={handleTextPasteSubmit}
                isLoading={uploadProgress > 0}
                disabled={realTimeTrainingStatus?.is_training}
              />
            </div>

            {/* Training Progress Details */}
            {trainingStatus.isTraining && (
              <div className="card-hover p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Training Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-dark-neon-blue">{trainingStatus.totalFiles}</p>
                    <p className="text-sm text-gray-400">Total Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-dark-neon-green">{trainingStatus.processedFiles}</p>
                    <p className="text-sm text-gray-400">Processed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-dark-neon-pink">{Array.isArray(trainingStatus?.errors) ? trainingStatus.errors.length : 0}</p>
                    <p className="text-sm text-gray-400">Errors</p>
                  </div>
                </div>
              </div>
            )}

            {/* Training Errors */}
            {Array.isArray(trainingStatus?.errors) && trainingStatus.errors.length > 0 && (
              <div className="card-hover p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-400" />
                  Training Errors
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.isArray(trainingStatus?.errors) && trainingStatus.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Training Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Storage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Total Files"
                value={storageStats?.active_files || 0}
                icon={DocumentTextIcon}
                color="blue"
                subtitle={`${storageStats?.deleted_files || 0} deleted`}
              />
              <StatCard
                title="Storage Used"
                value={formatBytes(storageStats?.total_size_bytes || 0)}
                icon={CloudArrowUpIcon}
                color="green"
              />
              <StatCard
                title="Selected Files"
                value={selectedDataFiles.length}
                icon={CheckCircleIcon}
                color="purple"
              />
              <StatCard
                title="Storage Path"
                value="training_data/"
                icon={FolderOpenIcon}
                color="pink"
              />
            </div>

            {/* Training Data Management */}
            <div className="card-hover p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <CloudArrowUpIcon className="h-5 w-5 mr-2 text-dark-neon-blue" />
                  Training Data Files
                </h3>
                <div className="flex items-center space-x-3">
                  {selectedDataFiles.length > 0 && (
                    <button
                      onClick={handleDeleteSelectedData}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedDataFiles.length})
                    </button>
                  )}
                  <button
                    onClick={handleSelectAllDataFiles}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {Array.isArray(trainingDataList) && selectedDataFiles.length === trainingDataList.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Data Files List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Array.isArray(trainingDataList) && trainingDataList.length > 0 ? (
                  trainingDataList.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-dark-accent/30 rounded-lg hover:bg-dark-accent/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedDataFiles.includes(file.id)}
                          onChange={() => handleSelectDataFile(file.id)}
                          className="w-4 h-4 text-dark-neon-blue bg-dark-muted border-dark-muted rounded focus:ring-dark-neon-blue"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{file.original_filename}</h4>
                          <p className="text-gray-400 text-sm">
                            ID: {file.id} • Size: {formatBytes(file.file_size)} • 
                            Uploaded: {new Date(file.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 text-sm font-medium">Active</span>
                        <p className="text-gray-400 text-xs">
                          {(file.processing_time * 1000).toFixed(0)}ms processing
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Training Data</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Upload training files to improve the AI model. All files are stored permanently until manually deleted.
                    </p>
                    <div className="mb-4 p-3 bg-dark-muted/30 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">📁 Supported File Formats:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
                        <div>📄 <strong>Documents:</strong> TXT, PDF, DOC, DOCX, RTF, MD</div>
                        <div>📊 <strong>Data:</strong> CSV, XLSX, XLS, JSON, XML</div>
                        <div>🌐 <strong>Web:</strong> HTML, HTM</div>
                        <div>🚫 <strong>Not supported:</strong> Images, Videos, Audio</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Storage Info */}
              {storageStats && (
                <div className="mt-6 p-4 bg-dark-muted/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Storage Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Storage Path:</span>
                      <p className="text-white font-mono text-xs break-all">{storageStats.storage_path}</p>
                    </div>
                    <div>
                      <span className="text-gray-300">Total Files:</span>
                      <p className="text-white">{storageStats.total_files} (Active: {storageStats.active_files})</p>
                    </div>
                    <div>
                      <span className="text-gray-300">Total Size:</span>
                      <p className="text-white">{formatBytes(storageStats.total_size_bytes)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Model Status"
                value={adminStats?.systemHealth?.modelStatus || 'Unknown'}
                icon={CpuChipIcon}
                color="blue"
              />
              <StatCard
                title="Last Model Update"
                value={formatTime(adminStats?.systemHealth?.lastModelUpdate)}
                icon={ClockIcon}
                color="green"
              />
              <StatCard
                title="Dataset Size"
                value={`${adminStats?.systemHealth?.datasetSize || 0} files`}
                icon={DocumentTextIcon}
                color="purple"
              />
            </div>

            {/* System Actions */}
            <div className="card-hover p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">System Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => updateModelStatus('healthy')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Mark Model Healthy
                </button>
                <button
                  onClick={() => updateModelStatus('maintenance')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Set Maintenance Mode
                </button>
                <button
                  onClick={resetAllStats}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Reset All Statistics
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Refresh Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
