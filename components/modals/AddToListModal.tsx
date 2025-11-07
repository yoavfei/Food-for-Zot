'use client';

import { useState, useEffect } from 'react';
import { useModal } from '@/hooks/use-modal-store';
import { Loader2, Check, X, ClipboardPlus, ListX } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'react-hot-toast'; 

interface Ingredient {
  name: string;
  amount: string;
  quantity?: string;
}
interface GroceryList {
  id: string;
  name: string;
  ownerId: string;
}

export const AddToListModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { recipeIngredients } = data;
  const { user } = useAuth();
  
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isModalOpen = isOpen && type === 'addToList';
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (isModalOpen && user) {
      const fetchLists = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`${API_URL}/api/lists?userId=${user.uid}`);
          if (!res.ok) throw new Error('Failed to fetch your lists.');
          const data: GroceryList[] = await res.json();
          setLists(data);
          if (data.length > 0) {
            setSelectedListId(data[0].id);
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLists();
    }
  }, [isModalOpen, user, API_URL]);


  const handleSubmit = async () => {
    if (!selectedListId || !recipeIngredients) {
      setError('Please select a list.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const itemsToAdd = recipeIngredients.map((ing) => ({
      name: `${ing.name} (${ing.amount || ing.quantity})`,
      purchased: false,
    }));

    const promise = Promise.all(
      itemsToAdd.map(item =>
        fetch(`${API_URL}/api/lists/${selectedListId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).then(res => {
          if (!res.ok) throw new Error('One or more items failed to add.');
        })
      )
    );

    toast.promise(
      promise,
      {
        loading: 'Adding items to list...',
        success: (data) => {
          handleClose();
          return 'Ingredients added!';
        },
        error: (err) => err.message,
      }
    );
  };

  const handleClose = () => {
    setSelectedListId(null);
    setLists([]);
    setIsSubmitting(false);
    onClose();
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl m-4">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 
                     rounded-full hover:bg-gray-100 transition-all"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <ClipboardPlus className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Add Ingredients to List
          </h2>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
          </div>
        )}
        {!isLoading && !error && lists.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a grocery list to add {recipeIngredients?.length || 0} items to:
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2 rounded-lg border border-gray-200 p-2">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`
                    w-full flex items-center p-3 rounded-lg text-left transition-all
                    ${selectedListId === list.id 
                      ? 'bg-green-100 text-green-800' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="flex-1 font-medium">{list.name}</span>
                  {selectedListId === list.id && <Check className="h-5 w-5" />}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 font-semibold text-white 
                         bg-green-600 rounded-lg shadow-md hover:bg-green-700 
                         focus:outline-none focus:ring-2 focus:ring-green-500 
                         focus:ring-offset-2 transition-all disabled:bg-gray-400"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Add Items
            </button>
          </div>
        )}
        {!isLoading && (error || lists.length === 0) && (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <ListX className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              {error ? 'Error' : 'No Lists Found'}
            </h3>
            <p className="text-sm text-gray-500">
              {error ? error : "You don't have any grocery lists. Please create one first."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};