'use client';

import { auth } from '../../lib/firebase'
import { signOut } from 'firebase/auth';

const navItems = [
  { name: 'Groceries', href: '/app', icon: '🛒' },
  { name: 'My Recipes', href: '/app/recipes', icon: '🍽️' },
];

const navigateReplace = (path: string) => {
  if (typeof window !== 'undefined') {
    const absolutePath = `${window.location.origin}${path}`;
    window.location.replace(absolutePath);
  }
};

export function Sidebar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const handleSignOut = async () => {
    await signOut(auth);
    navigateReplace('/login'); 
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-4 shadow-sm flex flex-col flex-shrink-0">
      <div className="px-2 pt-2 pb-6 mb-4 border-b border-gray-200">
        <a href="/app" className="flex items-center space-x-2">
          <span className="text-3xl">🛒</span>
          <span className="text-xl font-bold text-gray-800">
            Food For <span className="text-green-700">Zot</span>
          </span>
        </a>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg font-medium transition-all duration-150
                ${
                  isActive
                    ? 'bg-green-100 text-green-800 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 w-full p-3 rounded-lg font-medium 
            text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150"
        >
          <span className="text-lg">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}