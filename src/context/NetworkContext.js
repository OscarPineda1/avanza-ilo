import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { classifyNetworkState } from '../services/network-state';

const NetworkContext = createContext({
  isConnected: null,
  isInternetReachable: null,
  isOffline: true,
  availability: 'checking',
  type: null,
});

function normalizeNetworkState(netInfo) {
  const availability = classifyNetworkState(netInfo);
  return {
    isConnected: netInfo.isConnected ?? null,
    isInternetReachable: netInfo.isInternetReachable ?? null,
    isOffline: availability !== 'online',
    availability,
    type: netInfo.type ?? null,
  };
}

export function NetworkProvider({ children }) {
  const [state, setState] = useState({
    isConnected: null,
    isInternetReachable: null,
    isOffline: true,
    availability: 'checking',
    type: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netInfo) => {
      setState(normalizeNetworkState(netInfo));
    });

    NetInfo.fetch().then((netInfo) => {
      setState(normalizeNetworkState(netInfo));
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={state}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
