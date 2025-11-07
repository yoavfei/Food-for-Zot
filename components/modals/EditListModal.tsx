'use client';

import { useState, useEffect } from 'react';
import { useModal } from '@/hooks/use-modal-store';
import { ListPlus, Loader2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const EditListModal = () => {
  const { isOpen, onClose, type, data, triggerRefetch } = useModal();
  const { listId, listName } = data;

  const isModalOpen = isOpen && type === 'editList';

  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Pre-fill the form when the modal opens
  useEffect(() => {
    if (isModalOpen && listName) {
      setName(listName);
    }
  }, [isModalOpen, listName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('List name cannot be empty.');
      return;
    }
    if (name === listName) {
      handleClose(); // No change, just close
      return;
    }

    setIsSubmitting(true);

    const promise = fetch(`${API_URL}/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to update list.');
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: () => {
        triggerRefetch();
        handleClose();
        return 'List name updated!';
      },
      error: (err) => err.message,
    }).finally(() => setIsSubmitting(false));
  };

  const handleClose = () => {
    setError(null);
    setIsSubmitting(false);
    onClose();
    // Delay clearing the name to prevent flicker
    setTimeout(() => setName(''), 300);
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
              Edit List Name
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};