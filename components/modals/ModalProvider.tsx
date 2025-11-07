'use client';

import { useEffect, useState } from 'react';
import { CreateListModal } from '@/components/modals/CreateListModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddToListModal } from '@/components/modals/AddToListModal';
import { EditListModal } from '@/components/modals/EditListModal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateListModal />
      <ConfirmModal />
      <AddToListModal />
      <EditListModal />
    </>
  );
};