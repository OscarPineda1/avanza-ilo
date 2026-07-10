import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext({
  isConnected: true,
  isOffline: false,
  type: null,
});

export function NetworkProvider({ children }) {
  const [state, setState] = useState({
    isConnected: true,
    isOffline: false,
    type: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netInfo) => {
      const isConnected =
        netInfo.isConnected != null ? netInfo.isConnected : true;
      setState({
        isConnected,
        isOffline: !isConnected,
        type: netInfo.type,
      });
    });

    NetInfo.fetch().then((netInfo) => {
      const isConnected =
        netInfo.isConnected != null ? netInfo.isConnected : true;
      setState({
        isConnected,
        isOffline: !isConnected,
        type: netInfo.type,
      });
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
