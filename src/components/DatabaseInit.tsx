'use client';

import { useEffect, useRef } from 'react';
import { seedDatabase } from '@/db/seed';
import { broadcastService } from '@/services/broadcastService';
import { useAppStore } from '@/stores/appStore';

export default function DatabaseInit() {
  const initialized = useRef(false);
  const setDbReady = useAppStore((s) => s.setDbReady);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // Initialize database with mock data, then signal ready
      seedDatabase()
        .then(() => setDbReady(true))
        .catch((e) => {
          console.error(e);
          setDbReady(true); // still mark ready on error so pages don't hang
        });
      
      // Initialize broadcast channel for cross-tab communication
      broadcastService.init();
    }

    return () => {
      // Cleanup broadcast service on unmount
      broadcastService.destroy();
    };
  }, [setDbReady]);

  return null; // This is a logic-only component
}
