export type NetworkSnapshot = {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
};

export type NetworkAvailability = 'checking' | 'online' | 'no-network' | 'no-internet';

export function classifyNetworkState(netInfo: NetworkSnapshot): NetworkAvailability {
  if (netInfo.isConnected === false) return 'no-network';
  if (netInfo.isInternetReachable === false) return 'no-internet';
  if (netInfo.isConnected === true && netInfo.isInternetReachable === true) return 'online';
  return 'checking';
}
