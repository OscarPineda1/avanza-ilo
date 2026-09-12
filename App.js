import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NetworkProvider } from './src/context/NetworkContext';
import { CatalogProvider } from './src/context/CatalogContext';
import { LocationConsentProvider } from './src/context/LocationConsentContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <CatalogProvider>
          <LocationConsentProvider>
            <AppNavigator />
          </LocationConsentProvider>
        </CatalogProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
