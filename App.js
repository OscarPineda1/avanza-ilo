import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NetworkProvider } from './src/context/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';
import { getAllRoutes } from './src/services/routes';
import { cacheStaticRoutes } from './src/services/route-cache';

export default function App() {
  useEffect(() => {
    cacheStaticRoutes(getAllRoutes());
  }, []);

  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AppNavigator />
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
