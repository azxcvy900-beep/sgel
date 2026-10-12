'use client';

import React, { useState, useEffect } from 'react';
import { DeveloperPortal } from '../../components/DeveloperPortal';
import { INITIAL_CASES } from '../../data/casesData';
import { subscribeToCases, addCaseToFirebase, deleteCaseFromFirebase } from '../../firebase/db';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [cases, setCases] = useState(INITIAL_CASES);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCases(
      (remoteCases) => {
        if (remoteCases && remoteCases.length > 0) {
          setCases(remoteCases);
          setIsFirebaseConnected(true);
        }
      },
      () => setIsFirebaseConnected(false)
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleAddCase = async (newCase) => {
    setCases([newCase, ...cases]);
    await addCaseToFirebase(newCase);
  };

  const handleDeleteCase = async (caseId) => {
    setCases(cases.filter(c => c.id !== caseId));
    await deleteCaseFromFirebase(caseId);
  };

  return (
    <DeveloperPortal
      cases={cases}
      onAddCase={handleAddCase}
      onDeleteCase={handleDeleteCase}
      onSwitchToStore={() => router.push('/')}
      isFirebaseConnected={isFirebaseConnected}
    />
  );
}
