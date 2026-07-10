import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NetworkProvider } from './src/context/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AppNavigator />
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
