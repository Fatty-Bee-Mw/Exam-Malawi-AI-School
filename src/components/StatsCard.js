import React from 'react';

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: 'from-dark-neon-blue to-cyan-500',
    purple: 'from-dark-neon-purple to-pink-500',
    green: 'from-dark-neon-green to-emerald-500',
    pink: 'from-dark-neon-pink to-rose-500'
  };

  const bgClasses = {
    blue: 'bg-dark-neon-blue/20',
    purple: 'bg-dark-neon-purple/20',
    green: 'bg-dark-neon-green/20',
    pink: 'bg-dark-neon-pink/20'
  };

  return (
    <div className="card-hover p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`} />
        </div>
        <span className="text-sm font-medium text-dark-neon-green">{trend}</span>
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
