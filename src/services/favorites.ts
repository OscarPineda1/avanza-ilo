import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeFavoriteIdentifiers } from './favorites-core';

export { normalizeFavoriteIdentifiers } from './favorites-core';

const FAVORITES_KEY = '@avanza_ilo:favorites';

export async function getFavoriteRouteNames(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? normalizeFavoriteIdentifiers(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export async function replaceFavoriteRouteIds(routeIds: string[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(normalizeFavoriteIdentifiers(routeIds)));
}

export async function addFavoriteRoute(routeName: string): Promise<void> {
  const current = await getFavoriteRouteNames();
  if (!current.includes(routeName)) {
    current.push(routeName);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
  }
}

export async function removeFavoriteRoute(routeName: string): Promise<void> {
  const current = await getFavoriteRouteNames();
  const updated = current.filter((name) => name !== routeName);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export async function isFavoriteRoute(routeName: string): Promise<boolean> {
  const current = await getFavoriteRouteNames();
  return current.includes(routeName);
}

export async function toggleFavoriteRoute(routeName: string): Promise<boolean> {
  const isFavorite = await isFavoriteRoute(routeName);
  if (isFavorite) {
    await removeFavoriteRoute(routeName);
    return false;
  }
  await addFavoriteRoute(routeName);
  return true;
}
