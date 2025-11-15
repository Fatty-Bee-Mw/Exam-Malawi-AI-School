import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: PlusCircleIcon,
      label: 'Ask Question',
      color: 'blue',
      onClick: () => navigate('/dashboard?tab=assistant')
    },
    {
      icon: DocumentTextIcon,
      label: 'Generate Exam',
      color: 'purple',
      onClick: () => navigate('/dashboard?tab=assistant')
    },
    {
      icon: ChartBarIcon,
      label: 'View Progress',
      color: 'green',
      onClick: () => navigate('/dashboard?tab=progress')
    },
    {
      icon: BookOpenIcon,
      label: 'Study Materials',
      color: 'pink',
      onClick: () => console.log('Study materials')
    }
  ];

  const colorClasses = {
    blue: 'hover:bg-dark-neon-blue/20 hover:text-dark-neon-blue',
    purple: 'hover:bg-dark-neon-purple/20 hover:text-dark-neon-purple',
    green: 'hover:bg-dark-neon-green/20 hover:text-dark-neon-green',
    pink: 'hover:bg-dark-neon-pink/20 hover:text-dark-neon-pink'
  };

  return (
    <div className="space-y-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full flex items-center px-3 py-2 text-sm text-gray-300 rounded-lg transition-all ${colorClasses[action.color]}`}
          >
            <Icon className="h-4 w-4 mr-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
