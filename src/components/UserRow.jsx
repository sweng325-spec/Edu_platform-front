import React from 'react';

export default function UserRow({ user, onToggleStatus }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</td>
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
      <td className="py-3 px-4 text-sm">
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
          user.role === 'TEACHER' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
          user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="py-3 px-4 text-sm">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-right">
        {user.role !== 'ADMIN' && (
          <button
            onClick={() => onToggleStatus(user.id, !user.is_active)}
            className={`px-3 py-1 text-xs rounded-md font-medium text-white transition ${
              user.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {user.is_active ? 'Deactivate' : 'Activate'}
          </button>
        )}
      </td>
    </tr>
  );
}