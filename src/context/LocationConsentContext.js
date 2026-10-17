import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';

const LocationConsentContext = createContext({
  locationEnabled: false,
  setLocationEnabled: () => {},
  refreshLocationPermission: async () => false,
});

export function LocationConsentProvider({ children }) {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const refreshLocationPermission = useCallback(async () => {
    const permission = await Location.getForegroundPermissionsAsync();
    const enabled = permission.status === 'granted';
    setLocationEnabled(enabled);
    return enabled;
  }, []);

  useEffect(() => {
    refreshLocationPermission().catch(() => setLocationEnabled(false));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshLocationPermission().catch(() => setLocationEnabled(false));
    });
    return () => subscription.remove();
  }, [refreshLocationPermission]);

  const value = useMemo(() => ({ locationEnabled, setLocationEnabled, refreshLocationPermission }), [locationEnabled, refreshLocationPermission]);
  return <LocationConsentContext.Provider value={value}>{children}</LocationConsentContext.Provider>;
}

export function useLocationConsent() {
  return useContext(LocationConsentContext);
}
