'use client'; // This page is interactive, so it must be a Client Component

import { useState } from 'react';

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

  // --- Render ---
  return (
    // Container is now full-width, letting parent layout control padding
    <div className="w-full bg-background/95">
      {/* 1. Header */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
        My Groceries
      </h1>

      {/* 2. Tabbed List Navigation */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`py-3 px-5 text-lg font-semibold transition-all duration-150 cursor-pointer
              ${
                activeListId === list.id
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
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
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="E.g., 2% Milk"
          className="flex-1 px-4 py-3 border bg-white border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md 
                     hover:bg-green-700 focus:outline-none focus:ring-2 
                     focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
        >
          Add
        </button>
      </form>

      {/* 4. Active Grocery List Items */}
      <div className="rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {activeList && activeList.items.length > 0 ? (
            activeList.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center px-6 py-4 transition-all 
                           hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() => handleToggleItem(item.id)}
                  className="h-6 w-6 text-green-600 rounded 
                             focus:ring-green-500 cursor-pointer"
                />
                <span
                  className={`ml-4 text-lg text-gray-800
                    ${item.purchased ? 'line-through text-gray-400' : ''}`}
                >
                  {item.name}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="ml-auto text-gray-400 hover:text-red-500 font-bold text-xl 
                             opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Delete item"
                >
                  &times;
                </button>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 p-10">
              No items in this list yet.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}