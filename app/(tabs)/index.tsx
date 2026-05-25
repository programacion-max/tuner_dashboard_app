import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useOBD1 } from '@/lib/obd1-context';
import RacingDashboardScreen from './racing-dashboard';

export default function HomeScreen() {
  const router = useRouter();
  const { isConnected } = useOBD1();

  useEffect(() => {
    // Si no está conectado, ir a la pantalla de conexión
    if (!isConnected) {
      router.replace('/bluetooth-connect');
    }
  }, [isConnected, router]);

  return <RacingDashboardScreen />;
}
