'use client';

import { useEffect, useRef } from 'react';
import { seedDatabase } from '@/db/seed';
import { broadcastService } from '@/services/broadcastService';

export default function DatabaseInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // Initialize database with mock data
      seedDatabase().catch(console.error);
      
      // Initialize broadcast channel for cross-tab communication
      broadcastService.init();
    }

    return () => {
      // Cleanup broadcast service on unmount
      broadcastService.destroy();
    };
  }, []);

  return null; // This is a logic-only component
}
