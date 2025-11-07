'use client'; // This page is interactive, so it must be a Client Component

import { useState } from 'react';
import { Search, Plus, Check, X, ListX } from 'lucide-react';

// --- Define the data types ---
interface GroceryItem {
  id: string;
  name: string;
  purchased: boolean;
}

interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
}

// --- Mock Data (Backend replacement) ---
const MOCK_DATA: GroceryList[] = [
  {
    id: 'list1',
    name: 'Weekly Shop',
    items: [
      { id: 'item1', name: 'Milk (1 Gallon)', purchased: false },
      { id: 'item2', name: 'Eggs (Dozen)', purchased: true },
      { id: 'item3', name: 'Bread', purchased: false },
    ],
  },
  {
    id: 'list2',
    name: 'Party Supplies',
    items: [
      { id: 'item4', name: 'Chips', purchased: false },
      { id: 'item5', name: 'Salsa', purchased: false },
    ],
  },
];

// --- Main Page Component ---
export default function GroceriesDashboardPage() {
  // --- State Hooks ---
  const [lists, setLists] = useState<GroceryList[]>(MOCK_DATA);
  const [activeListId, setActiveListId] = useState<string>('list1');
  const [newItemName, setNewItemName] = useState('');

  // --- Helper: Find the currently active list ---
  const activeList = lists.find((list) => list.id === activeListId);

  // --- Event Handlers ---

  /**
   * Toggles the 'purchased' status of an item in the active list.
   */
  const handleToggleItem = (itemId: string) => {
    setLists(
      lists.map((list) =>
        list.id === activeListId
          ? {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId
                ? { ...item, purchased: !item.purchased }
                : item
            ),
          }
          : list
      )
    );
  };

  /**
   * Adds a new item to the active list.
   */
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeList) return;

    const newItem: GroceryItem = {
      id: `item-${Date.now()}`, // Simple unique ID
      name: newItemName.trim(),
      purchased: false,
    };

    setLists(
      lists.map((list) =>
        list.id === activeListId
          ? { ...list, items: [newItem, ...list.items] } // Add to top
          : list
      )
    );
    setNewItemName(''); // Clear input field
  };

  /**
   * Deletes an item from the active list.
   */
  const handleDeleteItem = (itemId: string) => {
    setLists(
      lists.map((list) =>
        list.id === activeListId
          ? {
            ...list,
            items: list.items.filter((item) => item.id !== itemId),
          }
          : list
      )
    );
  };

  return (
    <div className="w-full bg-background/95">
      {/* 1. Header */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
        My Groceries
      </h1>

      {/* 2. Tabbed List Navigation */}
      <div className="flex items-center border-b-1 border-gray-200 mb-6">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`py-3 px-5 text-lg font-semibold transition-all duration-150 cursor-pointer border-b-2
              ${activeListId === list.id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {list.name}
          </button>
        ))}
        <button
          onClick={() => alert('New List feature coming soon!')}
          className="ml-4 py-2 px-3 text-lg font-bold text-green-600 hover:text-green-800 cursor-pointer"
        >
          +
        </button>
      </div>

      {/* 3. Add New Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-3 mb-6">

        {/* Search Bar Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Search or add an item (e.g., 2% Milk)"
            className="flex-1 w-full pl-12 pr-4 py-3 border bg-white border-gray-300 rounded-lg shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Add Button (Icon-only) */}
        <button
          type="submit"
          className="flex-shrink-0 px-4 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md 
               hover:bg-green-700 focus:outline-none focus:ring-2 
               focus:ring-green-500 focus:ring-offset-2 cursor-pointer
               flex items-center justify-center"
          aria-label="Add item"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>

      {/* 4. Active Grocery List Items */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {activeList && activeList.items.length > 0 ? (
            activeList.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-4 py-4 transition-all hover:bg-gray-50"
              >
                {/* --- Modern Checkbox --- */}
                <button
                  onClick={() => handleToggleItem(item.id)}
                  className={`
              flex-shrink-0 h-6 w-6 rounded-md border-2 
              flex items-center justify-center transition-all cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              ${item.purchased
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }
            `}
                  aria-label="Toggle item"
                >
                  {item.purchased && <Check className="h-4 w-4 text-white" />}
                </button>

                {/* --- Item Name --- */}
                <span
                  className={`
              flex-1 text-base font-medium text-gray-700
              ${item.purchased ? 'line-through text-gray-400' : ''}
            `}
                >
                  {item.name}
                </span>

                {/* --- Delete Button --- */}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="ml-auto p-1 text-gray-400 hover:text-red-600 
                       rounded-full hover:bg-red-100 transition-all cursor-pointer"
                  aria-label="Delete item"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))
          ) : (
            // --- Modern Empty State ---
            <li className="flex flex-col items-center justify-center text-center p-12">
              <ListX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                List is Empty
              </h3>
              <p className="text-sm text-gray-500">
                Use the search bar above to add your first item.
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}