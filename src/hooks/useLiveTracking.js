import { useState, useEffect, useCallback, useRef } from 'react';
import adminService from '../services/adminService';

// Custom hook for live tracking data in admin dashboard (HTTP polling only)
export function useLiveTracking(isEnabled = true, pollInterval = 5000) {
  const [data, setData] = useState({
    stats: null,
    health: null,
    training: null,
    analytics: null,
    lastUpdate: null,
    isLoading: true,
    error: null,
  });

  const [connectionStatus, setConnectionStatus] = useState('polling');
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchLiveData = useCallback(async () => {
    if (!isEnabled || !mountedRef.current) return;

    try {
      const [statsResponse, healthResponse, analyticsResponse] = await Promise.allSettled([
        adminService.getLiveStats(),
        adminService.getSystemHealth(),
        adminService.getUserAnalytics(),
      ]);

      const newData = {
        stats: statsResponse.status === 'fulfilled' && statsResponse.value.success 
          ? statsResponse.value.data : null,
        health: healthResponse.status === 'fulfilled' && healthResponse.value.success 
          ? healthResponse.value.data : null,
        analytics: analyticsResponse.status === 'fulfilled' && analyticsResponse.value.success 
          ? analyticsResponse.value.data : null,
        lastUpdate: new Date().toISOString(),
        isLoading: false,
        error: null,
      };

      if (mountedRef.current) {
        setData(newData);
        setConnectionStatus('polling');
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error);
      if (mountedRef.current) {
        setData(prev => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
        setConnectionStatus('error');
      }
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    fetchLiveData();
    intervalRef.current = setInterval(fetchLiveData, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, pollInterval, fetchLiveData]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const getConnectionInfo = useCallback(() => {
    return {
      status: connectionStatus,
      isWebSocketConnected: false,
      lastUpdate: data.lastUpdate,
    };
  }, [connectionStatus, data.lastUpdate]);

  return {
    ...data,
    connectionStatus,
    refresh,
    getConnectionInfo,
  };
}

export default useLiveTracking;
