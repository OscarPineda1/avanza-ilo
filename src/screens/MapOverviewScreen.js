import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { useCatalog } from '../context/CatalogContext';
import { theme } from '../styles/global-styles';
import RouteBadge from '../components/RouteBadge';
import RouteMapLayers from '../components/RouteMapLayers';
import { useLocationConsent } from '../context/LocationConsentContext';
import { OFFICIAL_STOPS_BY_ROUTE } from '../services/official-stops';

function regionFromCoordinates(coordinates, latitudePadding = 1.18, longitudePadding = 1.25) {
    const latitudes = coordinates.map((item) => item.latitude);
    const longitudes = coordinates.map((item) => item.longitude);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    return {
        latitude: (minLatitude + maxLatitude) / 2 - 0.001,
        longitude: (minLongitude + maxLongitude) / 2,
        latitudeDelta: Math.max((maxLatitude - minLatitude) * latitudePadding, 0.014),
        longitudeDelta: Math.max((maxLongitude - minLongitude) * longitudePadding, 0.018),
    };
}

const allOfficialStopCoordinates = Object.values(OFFICIAL_STOPS_BY_ROUTE).flat().map((stop) => stop.coordinate);
const iloRoutesRegion = regionFromCoordinates(allOfficialStopCoordinates);

export default function MapOverviewScreen({ navigation }) {
    const mapRef = useRef(null);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [reduceMotion, setReduceMotion] = useState(false);
    const { routes: catalogRoutes, status } = useCatalog();
    const { locationEnabled } = useLocationConsent();
    const mapsConfigured = Platform.OS === 'android'
        ? Constants.expoConfig?.extra?.mapsConfigured?.android
        : Constants.expoConfig?.extra?.mapsConfigured?.ios;
    const routes = useMemo(() => catalogRoutes.filter((item) => item.available && item.coordinates?.length).slice(0, 3), [catalogRoutes]);
    const selectedRoute = routes.find((item) => item.id === selectedRouteId) || routes[0];
    const orderedRoutes = useMemo(() => [...routes].sort((left, right) => {
        if (left.id === selectedRoute?.id) return 1;
        if (right.id === selectedRoute?.id) return -1;
        return 0;
    }), [routes, selectedRoute?.id]);
    const loading = status === 'loading' && routes.length === 0;

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
        const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
        return () => subscription.remove();
    }, []);

    const moveMap = (region) => mapRef.current?.animateToRegion(region, reduceMotion ? 0 : 220);

    const focusRoute = (route) => {
        setSelectedRouteId(route.id);
        const coordinates = (OFFICIAL_STOPS_BY_ROUTE[route.nombre] || []).map((stop) => stop.coordinate);
        moveMap(coordinates.length ? regionFromCoordinates(coordinates, 1.3, 1.35) : iloRoutesRegion);
    };

    const centerRoutes = () => {
        moveMap(iloRoutesRegion);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                initialRegion={iloRoutesRegion}
                style={styles.map}
                showsUserLocation={locationEnabled}
                showsMyLocationButton={false}
                toolbarEnabled={false}
            >
                {orderedRoutes.map((item) => <RouteMapLayers key={item.id} route={item} showStops={false} showDirectionMarkers={false} muted={item.id !== selectedRoute?.id} />)}
            </MapView>

            {!mapsConfigured ? <View pointerEvents="none" style={styles.mapNotice}><Ionicons name="map-outline" size={17} color={theme.colors.surface} /><Text style={styles.mapNoticeText}>El mapa no está disponible</Text></View> : null}

            <View style={styles.topBar}>
                <View style={styles.titlePill}><Ionicons name="map-outline" size={20} color={theme.colors.primary} /><Text style={styles.titlePillText}>Rutas de Ilo</Text></View>
                <View style={styles.mapActions}>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Centrar las rutas" onPress={centerRoutes} style={styles.iconButton}><Ionicons name="scan-outline" size={21} color={theme.colors.textDark} /></TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Buscar ruta" onPress={() => navigation.navigate('SearchResults')} style={styles.iconButton}><Ionicons name="search-outline" size={21} color={theme.colors.textDark} /></TouchableOpacity>
                </View>
            </View>

            <View style={styles.sheet}>
                <View style={styles.handle} />
                <Text style={styles.sheetTitle}>Explora las rutas</Text>
                <Text style={styles.sheetSubtitle}>Toca una ruta para acercar el mapa.</Text>

                {loading ? (
                    <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.loadingText}>Cargando rutas…</Text></View>
                ) : routes.length ? (
                    <View style={styles.routeRow}>
                        {routes.map((item) => {
                            const active = item.id === selectedRoute?.id;
                            return (
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                    accessibilityLabel={`Enfocar ruta ${item.nombre}`}
                                    key={item.id}
                                    onPress={() => focusRoute(item)}
                                    style={[styles.routeChip, { borderColor: active ? item.color : theme.colors.border, backgroundColor: active ? `${item.color}14` : theme.colors.background }]}
                                >
                                    <RouteBadge route={item.nombre} color={item.color} size="small" />
                                    <Text style={[styles.routeName, active && { color: item.color }]}>Ruta {item.nombre}</Text>
                                    {active ? <Ionicons name="checkmark-circle" size={15} color={item.color} /> : null}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : <Text style={styles.emptyText}>No pudimos cargar las rutas.</Text>}

                {selectedRoute ? <View style={styles.actionsRow}>
                    <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('RouteDetails', { routeId: selectedRoute.id, sequenceId: selectedRoute.defaultSequenceId })} style={[styles.primaryAction, { backgroundColor: selectedRoute.color }]}><Ionicons name="map" size={18} color={theme.colors.surface} /><Text style={styles.primaryActionText}>Abrir ruta {selectedRoute.nombre}</Text></TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('NearbyStops')} style={styles.secondaryAction}><Ionicons name="location-outline" size={18} color={theme.colors.primary} /><Text style={styles.secondaryActionText}>Paraderos</Text></TouchableOpacity>
                </View> : null}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    map: { ...StyleSheet.absoluteFillObject },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    titlePill: { height: 45, paddingHorizontal: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.base },
    titlePillText: { color: theme.colors.primary, fontWeight: '800', fontSize: 16 },
    mapActions: { flexDirection: 'row', gap: 8 },
    iconButton: { height: 45, width: 45, borderRadius: 14, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.base },
    mapNotice: { position: 'absolute', top: 76, left: 16, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#1B2730E8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
    mapNoticeText: { color: theme.colors.surface, fontSize: 13, fontWeight: '700' },
    sheet: { marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: theme.colors.surface, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, ...theme.shadows.heavy },
    handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: '#D9E0E3', marginBottom: 12 },
    sheetTitle: { color: theme.colors.textDark, fontSize: 21, fontWeight: '800' },
    sheetSubtitle: { color: theme.colors.textMuted, fontSize: 14, marginTop: 3 },
    routeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    routeChip: { flex: 1, minHeight: 76, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 16, borderWidth: 1.5 },
    routeName: { fontSize: 13, fontWeight: '800', color: theme.colors.textDark },
    actionsRow: { flexDirection: 'row', gap: 9, marginTop: 12 },
    primaryAction: { flex: 1.25, minHeight: 50, paddingHorizontal: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
    primaryActionText: { color: theme.colors.surface, fontSize: 14, fontWeight: '800' },
    secondaryAction: { flex: 1, minHeight: 50, paddingHorizontal: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    secondaryActionText: { color: theme.colors.primary, fontSize: 14, fontWeight: '800' },
    loading: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
    loadingText: { color: theme.colors.textMuted, fontSize: 14 },
    emptyText: { color: theme.colors.textMuted, fontSize: 14, paddingVertical: 20, textAlign: 'center' },
});
