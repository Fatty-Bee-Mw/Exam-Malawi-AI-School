import React from 'react';
import { 
  WifiIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function ConnectionStatus({ 
  status, 
  lastUpdate, 
  onRefresh, 
  className = '' 
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          text: 'Live',
          description: 'Real-time updates active'
        };
      case 'disconnected':
        return {
          icon: WifiIcon,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          text: 'Polling',
          description: 'Using periodic updates'
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          text: 'Error',
          description: 'Connection issues detected'
        };
      default:
        return {
          icon: ArrowPathIcon,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          text: 'Connecting',
          description: 'Establishing connection'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const update = new Date(timestamp);
    const diffMs = now - update;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}m ago`;
    } else {
      return update.toLocaleTimeString();
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bgColor}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
      
      <div className="text-xs text-gray-400">
        <div>{config.description}</div>
        <div>Updated: {formatLastUpdate(lastUpdate)}</div>
      </div>
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          title="Refresh data"
        >
          <ArrowPathIcon className="h-4 w-4 text-gray-400 hover:text-white" />
        </button>
      )}
    </div>
  );
}
