'use client';

import { useState } from 'react';
import { useModal } from '@/hooks/use-modal-store';
import { Loader2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-hot-toast'; 

export const ConfirmModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { title, description, onConfirm } = data;

  const isModalOpen = isOpen && type === 'deleteConfirm';

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;

    setIsLoading(true);
    
    const promise = (async () => {
      return await onConfirm();
    })();
    
    toast.promise(
      promise,
      {
        loading: 'Deleting...',
        success: (data) => {
          onClose();
          return 'Deleted successfully!';
        },
        error: (err) => err.message,
      }
    ).finally(() => setIsLoading(false));
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl m-4">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 
                     rounded-full hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {title || 'Are you sure?'}
          </h2>
          <p className="text-gray-600 mb-8">
            {description || 'This action cannot be undone.'}
          </p>

          <div className="flex w-full gap-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-5 py-3 font-semibold text-gray-700 
                         bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 
                         focus:outline-none focus:ring-2 focus:ring-gray-400 
                         focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white 
                         bg-red-600 rounded-lg shadow-md hover:bg-red-700 
                         focus:outline-none focus:ring-2 focus:ring-red-500 
                         focus:ring-offset-2 transition-all disabled:bg-red-400"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : null}
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};