import React from 'react';

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-700">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🛒</span>
        <span className="font-semibold">Loading your dashboard...</span>
      </div>
    </div>
  );
}