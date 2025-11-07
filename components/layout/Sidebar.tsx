'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  List,
  BookOpenText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Search,
} from 'lucide-react';

import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

// --- Nav Items Configuration ---
const navItems = [
  {
    name: 'Groceries',
    href: '/app',
    icon: List,
  },
  {
    name: 'My Recipes',
    href: '/app/recipes',
    icon: BookOpenText,
  },
  {
    name: 'Search Ingredients',
    href: '/app/search',
    icon: Search,
  }
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <aside
      className={`
        bg-white border-r border-gray-100 p-4 shadow-lg flex flex-col flex-shrink-0 relative
        transition-all duration-300 ease-in-out
        rounded-tr-2xl rounded-br-2xl
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
    >
      {/* --- Collapse Toggle Button --- */}
      <button
        onClick={handleToggle}
        className={`
          absolute top-1/2 -right-4 -translate-y-1/2 z-20
          flex items-center justify-center h-8 w-8 rounded-full
          bg-white border-2 border-gray-200 shadow-md
          text-gray-500 hover:text-green-700 hover:border-green-200
          transition-all
        `}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      {/* --- Logo / Header --- */}
      <div
        className={`
          pt-2 pb-6 mb-4 border-b border-gray-200
          flex items-center overflow-hidden
        `}
      >
        <Link href="/app" className="flex  space-x-3 p-3 rounded-lg font-medium transition-all duration-150">
          <ShoppingCart className="h-6 w-6 flex-shrink-0" />
          <div
            className={`
              transition-all duration-200
              ${isExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}
            `}
          >
            <span className="text-xl font-bold text-gray-800 whitespace-nowrap">
              Food For <span className="text-green-700">Zot</span>
            </span>
          </div>
        </Link>
      </div>

      {/* --- Navigation Links --- */}
      <nav className={`flex flex-col flex-1 space-y-2 ${isExpanded ? '' : 'items-start'}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isExpanded ? undefined : item.name}
              className={`
                flex items-center p-3 rounded-lg font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-green-100 text-green-800 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                }
                ${!isExpanded && 'justify-center'}
              `}
            >
              <item.icon className={`h-6 w-6 flex-shrink-0`} />

              <div
                className={`
                  transition-all duration-200
                  ${isExpanded ? 'pl-3 opacity-100 max-w-full' : 'opacity-0 w-0'}
                `}
              >
                <span className="transition-opacity duration-200 whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* --- Sign Out Button --- */}
      <div className={`flex mt-auto ${isExpanded ? '' : 'items-start'}`}>
        <button
          onClick={handleSignOut}
          title={isExpanded ? undefined : 'Sign Out'}
          className={`
            flex w-full p-3 rounded-lg font-medium
            text-gray-600 hover:bg-gray-100 hover:text-gray-900
            transition-all duration-150
          `}
        >
          <LogOut className="h-6 w-6 flex-shrink-0" />
          <div
            className={`
              transition-all duration-200
              ${isExpanded ? 'pl-3 opacity-100 max-w-full' : 'opacity-0 w-0'}
            `}
          >
            <span className="transition-opacity duration-200 whitespace-nowrap">
              Sign Out
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}