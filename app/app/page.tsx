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

// Mock Data 
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

export default function GroceriesDashboardPage() {
  const [lists, setLists] = useState<GroceryList[]>(MOCK_DATA);
  const [activeListId, setActiveListId] = useState<string>('list1');
  const [newItemName, setNewItemName] = useState('');

  const activeList = lists.find((list) => list.id === activeListId);

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

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeList) return;

    const newItem: GroceryItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      purchased: false,
    };

    setLists(
      lists.map((list) =>
        list.id === activeListId
          ? { ...list, items: [...list.items, newItem] }
          : list
      )
    );
    setNewItemName('');
  };

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
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
        My Groceries
      </h1>

      {/* Tabbed List Navigation */}
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

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="e.g., 2% Milk"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md 
                     hover:bg-green-700 focus:outline-none focus:ring-2 cursor-pointer
                     focus:ring-green-500 focus:ring-offset-2"
        >
          Add
        </button>
      </form>

      {/* Active Grocery List Items */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <ul className="space-y-4">
          {activeList && activeList.items.length > 0 ? (
            activeList.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center p-3 rounded-lg transition-all 
                           hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() => handleToggleItem(item.id)}
                  className="h-6 w-6 text-green-600 border-gray-300 rounded 
                             focus:ring-green-500 cursor-pointer"
                />
                <span
                  className={`ml-4 text-lg text-gray-700
                    ${item.purchased ? 'line-through text-gray-400' : ''}`}
                >
                  {item.name}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="ml-auto text-gray-400 hover:text-red-500 font-bold text-xl cursor-pointer"
                  aria-label="Delete item"
                >
                  &times;
                </button>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No items in this list yet.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}