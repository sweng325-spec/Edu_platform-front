import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'indigo' }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600 dark:bg-gray-800 dark:text-${color}-400`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}