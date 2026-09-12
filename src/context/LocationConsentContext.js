import React, { createContext, useContext, useMemo, useState } from 'react';

const LocationConsentContext = createContext({
  locationEnabled: false,
  setLocationEnabled: () => {},
});

export function LocationConsentProvider({ children }) {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const value = useMemo(() => ({ locationEnabled, setLocationEnabled }), [locationEnabled]);
  return <LocationConsentContext.Provider value={value}>{children}</LocationConsentContext.Provider>;
}

export function useLocationConsent() {
  return useContext(LocationConsentContext);
}
