'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useModal } from '@/hooks/use-modal-store';
import {
  Search,
  Plus,
  Check,
  X,
  ListX,
  Loader2,
  AlertTriangle,
  Trash2,
  Pencil,
} from 'lucide-react';

interface GroceryItem {
  id: string;
  name: string;
  purchased: boolean;
}
interface GroceryList {
  id: string;
  name: string;
  ownerId: string;
}
const LoadingState = () => (
  <div className="flex justify-center items-center p-12 mt-10">
    <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
  </div>
);
const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center text-center p-12 bg-red-50 rounded-2xl shadow-sm border border-red-200">
    <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
    <h2 className="text-2xl font-semibold text-red-800 mb-2">
      Error Loading Groceries
    </h2>
    <p className="text-red-600 max-w-sm">{message}</p>
  </div>
);

export default function GroceriesDashboardPage() {
  const { user } = useAuth();
  const { onOpen, refetchId, triggerRefetch } = useModal(); // Get triggerRefetch

  const [lists, setLists] = useState<GroceryList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // --- Data Fetching ---

  useEffect(() => {
    if (!user) return;

    const fetchLists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/lists?userId=${user.uid}`);
        if (!res.ok) {
          throw new Error('Failed to fetch your lists.');
        }
        const data: GroceryList[] = await res.json();
        setLists(data);

        if (data.length > 0) {
          const currentListExists = data.some((list) => list.id === activeListId);
          if (!activeListId || !currentListExists) {
            setActiveListId(data[0].id);
          }
        } else {
          setActiveListId(null);
          setItems([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLists();
  }, [user, API_URL, refetchId, activeListId]);

  useEffect(() => {
    if (isLoading || !activeListId) {
      if (!activeListId) setItems([]);
      return;
    }

    const fetchItems = async () => {
      setIsItemsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/lists/${activeListId}/items`);
        if (!res.ok) {
          throw new Error('Failed to fetch items for this list.');
        }
        const data: GroceryItem[] = await res.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsItemsLoading(false);
      }
    };
    fetchItems();
  }, [activeListId, API_URL, isLoading]);

  // --- Event Handlers ---

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, purchased: !currentStatus } : item
      )
    );
    try {
      await fetch(`${API_URL}/api/lists/${activeListId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchased: !currentStatus }),
      });
    } catch (err) {
      setError('Failed to update item. Please reload.');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeListId) return;

    const newItemData = {
      name: newItemName.trim(),
      purchased: false,
    };

    try {
      const res = await fetch(`${API_URL}/api/lists/${activeListId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });

      if (!res.ok) throw new Error('Failed to add item.');
      const addedItem: GroceryItem = await res.json();
      setNewItemName('');
      setItems((currentItems) => [addedItem, ...currentItems]);

    } catch (err: any) {
      setError(err.message || 'Failed to add item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
    try {
      await fetch(`${API_URL}/api/lists/${activeListId}/items/${itemId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      setError('Failed to delete item. Please reload.');
    }
  };

  const handleDeleteList = async (listId: string) => {
    const listName = lists.find(list => list.id === listId)?.name || "this list";

    onOpen('deleteConfirm', {
      title: `Delete "${listName}"?`,
      description: 'All items in this list will be permanently deleted. This cannot be undone.',
      onConfirm: () => {
        return fetch(`${API_URL}/api/lists/${listId}`, {
          method: 'DELETE',
        }).then((res) => {
          if (!res.ok) {
            throw new Error('Failed to delete list on server.');
          }
          triggerRefetch();
        });
      }
    });
  };

  if (isLoading || isItemsLoading) {
    return (
      <div className='flex items-center justify-center w-full h-full'>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="w-full bg-background/95">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-12">
        My Groceries
      </h1>

      <div className="flex items-center border-b-2 border-gray-200 mb-6">
        {lists.map((list) => (
          <div
            key={list.id}
            className={`flex items-center transition-all duration-150 border-b-2
              ${activeListId === list.id
                ? 'border-green-600'
                : 'border-transparent'
              }`}
          >
            <button
              onClick={() => setActiveListId(list.id)}
              className={`py-3 px-5 text-lg font-semibold
                ${activeListId === list.id
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {list.name}
            </button>

            {/* Show delete button ONLY for the active list */}
            {activeListId === list.id && (
              <div className="flex items-center pr-2">
                <button
                  onClick={() => onOpen('editList', { listId: list.id, listName: list.name })}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  title="Edit list name"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                  title="Delete this list"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => onOpen('createList')}
          className="ml-4 p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
          title="Create new list"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>


      {lists.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center text-center p-12 mt-10 bg-white rounded-2xl shadow-sm border border-gray-200">
          <ListX className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No Grocery Lists
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm">
            Click the "+" button above to create your first list.
          </p>
        </div>
      ) : null}

      {activeListId && (
        <>
          <form onSubmit={handleAddItem} className="flex gap-3 mb-6">
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
            <button
              type="submit"
              className="flex-shrink-0 px-4 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md 
                         hover:bg-green-700 focus:outline-none focus:ring-2 
                         focus:ring-green-500 focus:ring-offset-2
                         flex items-center justify-center"
              aria-label="Add item"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {items.length > 0 ? (
                items
                  .sort((a, b) => {
                    return a.purchased === b.purchased ? 0 : a.purchased ? 1 : -1;
                  })
                  .map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-4 px-4 py-4 transition-all hover:bg-gray-50"
                    >
                      <button
                        onClick={() => handleToggleItem(item.id, item.purchased)}
                        className={`
                        flex-shrink-0 h-6 w-6 rounded-md border-2 
                        flex items-center justify-center transition-all
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                        ${item.purchased
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                          }
                      `}
                        aria-label="Toggle item"
                      >
                        {item.purchased && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>

                      <span
                        className={`
                        flex-1 text-base font-medium text-gray-700
                        ${item.purchased ? 'line-through text-gray-400' : ''}
                      `}
                      >
                        {item.name}
                      </span>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="ml-auto p-1 text-gray-400 hover:text-red-600 
                                 rounded-full hover:bg-red-100 transition-all"
                        aria-label="Delete item"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </li>
                  ))
              ) : (
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
        </>
      )}
    </div>
  );
}