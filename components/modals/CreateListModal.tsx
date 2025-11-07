'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/hooks/use-modal-store';
import { useAuth } from '@/hooks/use-auth';
import { ListPlus, Loader2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const CreateListModal = () => {
  const { isOpen, onClose, type, triggerRefetch } = useModal();
  const router = useRouter();
  const { user } = useAuth();

  const isModalOpen = isOpen && type === 'createList';

  const [listName, setListName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!listName.trim()) {
      setError('List name cannot be empty.');
      return;
    }
    if (!user) {
      setError('You must be logged in.');
      return;
    }

    setIsSubmitting(true);

    const listData = {
      name: listName.trim(),
      ownerId: user.uid,
    };

    const promise = fetch(`${API_URL}/api/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listData),
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to create list.');
    });

    toast.promise(
      promise,
      {
        loading: 'Creating new list...',
        success: (data) => {
          triggerRefetch();
          handleClose();
          return 'New list created!';
        },
        error: (err) => err.message,
      }
    );
  };

  const handleClose = () => {
    setListName('');
    setError(null);
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3">
            <ListPlus className="h-8 w-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Create a New List
            </h2>
          </div>

          <div>
            <label
              htmlFor="listNameModal"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              List Name
            </label>
            <input
              type="text"
              id="listNameModal"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Weekly Essentials"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 font-semibold text-white 
                       bg-green-600 rounded-lg shadow-md hover:bg-green-700 
                       focus:outline-none focus:ring-2 focus:ring-green-500 
                       focus:ring-offset-2 transition-all disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isSubmitting ? 'Saving...' : 'Create List'}
          </button>
        </form>
      </div>
    </div>
  );
};