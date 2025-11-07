import { create } from 'zustand';
import { User } from 'firebase/auth';

interface Ingredient {
  name: string;
  amount: string;
  quantity?: string;
}

export type ModalType = 'createList' | 'deleteConfirm' | 'addToList' | 'editList';

interface ModalData {
  title?: string;
  description?: string;
  onConfirm?: () => Promise<void>;
  recipeIngredients?: Ingredient[];
  user?: User | null;
  listId?: string; 
  listName?: string;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
  refetchId: number;
  triggerRefetch: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null, data: {} }),
  refetchId: 0,
  triggerRefetch: () => set((state) => ({ refetchId: state.refetchId + 1 })),
}));