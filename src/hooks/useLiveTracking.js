import { useState, useEffect, useCallback, useRef } from 'react';
import adminService from '../services/adminService';
import websocketService from '../services/websocketService';

// Custom hook for live tracking data in admin dashboard
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

  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Fetch all live data
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
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error);
      if (mountedRef.current) {
        setData(prev => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      }
    }
  }, [isEnabled]);

  // WebSocket event handlers
  const handleWebSocketData = useCallback((wsData) => {
    if (!mountedRef.current) return;

    setData(prev => ({
      ...prev,
      ...wsData,
      lastUpdate: new Date().toISOString(),
    }));
  }, []);

  const handleWebSocketConnected = useCallback(() => {
    setConnectionStatus('connected');
  }, []);

  const handleWebSocketDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
  }, []);

  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error:', error);
    setConnectionStatus('error');
  }, []);

  // Initialize live tracking
  useEffect(() => {
    if (!isEnabled) return;

    // Initial data fetch
    fetchLiveData();

    // Set up WebSocket connection
    websocketService.on('data', handleWebSocketData);
    websocketService.on('connected', handleWebSocketConnected);
    websocketService.on('disconnected', handleWebSocketDisconnected);
    websocketService.on('error', handleWebSocketError);

    // Try to connect WebSocket (fallback to polling if it fails)
    websocketService.connect();

    // Set up polling as fallback
    intervalRef.current = setInterval(fetchLiveData, pollInterval);

    return () => {
      // Cleanup
      websocketService.off('data', handleWebSocketData);
      websocketService.off('connected', handleWebSocketConnected);
      websocketService.off('disconnected', handleWebSocketDisconnected);
      websocketService.off('error', handleWebSocketError);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, pollInterval, fetchLiveData, handleWebSocketData, handleWebSocketConnected, handleWebSocketDisconnected, handleWebSocketError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      websocketService.disconnect();
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Get connection info
  const getConnectionInfo = useCallback(() => {
    return {
      status: connectionStatus,
      isWebSocketConnected: websocketService.isConnected(),
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
