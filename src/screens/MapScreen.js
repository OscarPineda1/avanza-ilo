import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { globalStyles, theme } from '../styles/global-styles';
import { getRouteByName, getRouteCoordinates } from '../services/routes';
import { getEta } from '../services/eta';
import { toggleFavoriteRoute, isFavoriteRoute } from '../services/favorites';
import { useNetwork } from '../context/NetworkContext';
import MapInfoCard from '../components/MapInfoCard';
import RouteMapLayers from '../components/RouteMapLayers';

const regionIlo = {
    latitude: -17.6433,
    longitude: -71.3444,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
};

export default function MapScreen({ route, navigation }) {
    const routeName = route.params?.routeName;
    const requestedOriginStopId = route.params?.originStopId;
    const routeData = routeName ? getRouteByName(routeName) : undefined;
    const coordinates = routeData ? getRouteCoordinates(routeData.nombre) : null;
    const { isOffline } = useNetwork();
    const mapRef = useRef(null);

    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedStop, setSelectedStop] = useState(null);
    const [destinationStop, setDestinationStop] = useState(null);
    const [eta, setEta] = useState(null);

    const stops = routeData?.stops || [];

    useEffect(() => {
        if (routeData) {
            isFavoriteRoute(routeData.nombre).then(setIsFavorite);
        }
    }, [routeData]);

    useEffect(() => {
        if (stops.length > 0) {
            const requestedOrigin = stops.find((stop) => stop.id === requestedOriginStopId);
            setDestinationStop(stops[stops.length - 1]);
            setSelectedStop(requestedOrigin || stops[0]);
        }
    }, [routeData?.nombre, requestedOriginStopId]);

    useEffect(() => {
        let unmounted = false;

        async function requestLocation() {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (unmounted) return;
                if (status !== 'granted') {
                    Alert.alert('Permiso denegado', 'No se pudo acceder a la ubicación. Puedes seleccionar un paradero manualmente.');
                    return;
                }

                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
            } catch {
                if (!unmounted) {
                    Alert.alert('Ubicación no disponible', 'Activa el GPS o selecciona un paradero manualmente.');
                }
            }
        }

        requestLocation();

        return () => {
            unmounted = true;
        };
    }, []);

    useEffect(() => {
        if (!selectedStop || !destinationStop || !routeData || isOffline) {
            setEta(null);
            return;
        }

        let cancelled = false;
        setEta({ minutes: 0, loading: true });

        getEta(routeData.nombre, selectedStop.id, destinationStop.id)
            .then((result) => {
                if (!cancelled) {
                    setEta(result ? { ...result, loading: false } : null);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setEta(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [selectedStop, destinationStop, routeData, isOffline]);

    const handleToggleFavorite = useCallback(async () => {
        if (!routeData) return;
        const next = await toggleFavoriteRoute(routeData.nombre);
        setIsFavorite(next);
    }, [routeData]);

    const handleSelectStop = useCallback((stop) => {
        setSelectedStop(stop);
    }, []);

    const fitRouteToMap = useCallback(() => {
        if (coordinates?.length > 1) {
            mapRef.current?.fitToCoordinates(coordinates, {
                animated: false,
                edgePadding: { top: 110, right: 45, bottom: 280, left: 45 },
            });
        }
    }, [coordinates]);

    return (
        <View style={globalStyles.safeArea}>
            <MapView
                ref={mapRef}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                initialRegion={regionIlo}
                showsUserLocation={true}
                followsUserLocation={true}
                onMapReady={fitRouteToMap}
            >
                <RouteMapLayers route={routeData} selectedStopId={selectedStop?.id} onStopPress={handleSelectStop} />
            </MapView>

            <SafeAreaView style={styles.topOverlay}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
                </TouchableOpacity>
                {routeData ? (
                    <View style={styles.routeHeader}>
                        <View style={[styles.colorIndicator, { backgroundColor: routeData.color }]} />
                        <Text style={styles.routeTitle}>Ruta {routeData.nombre}</Text>
                    </View>
                ) : (
                    <View style={styles.routeHeader}>
                        <Text style={styles.routeTitle}>Mapa en vivo</Text>
                    </View>
                )}
                {routeData?.stops?.length > 0 && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Elegir paradero manualmente" style={styles.manualStopButton} onPress={() => navigation.navigate('StopSelection', { routeName: routeData.nombre })}>
                    <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>}
            </SafeAreaView>

            {routeData?.coordinates?.length > 1 && <View pointerEvents="none" style={styles.directionHint}>
                <View style={[styles.directionIcon, { backgroundColor: routeData.color }]}><Ionicons name="navigate" size={15} color={theme.colors.surface} /></View>
                <Text style={styles.directionText}>Sigue las flechas: indican el sentido de la ruta</Text>
            </View>}

            {routeData && (
                <MapInfoCard
                    datosRuta={routeData}
                    hasCoordinates={stops.length > 0 || !!coordinates}
                    isOffline={isOffline}
                    eta={eta}
                    originName={selectedStop?.name}
                    destinationName={destinationStop?.name}
                    isFavorite={isFavorite}
                    onToggleFavorite={handleToggleFavorite}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    topOverlay: {
        position: 'absolute', top: 0, left: 20, right: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    backButton: {
        backgroundColor: theme.colors.surface,
        padding: 12, borderRadius: 50,
        ...theme.shadows.base,
    },
    routeHeader: {
        backgroundColor: theme.colors.surface,
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20,
        ...theme.shadows.base,
    },
    manualStopButton: {
        backgroundColor: theme.colors.surface,
        width: 48, height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
        ...theme.shadows.base,
    },
    directionHint: {
        position: 'absolute', top: 75, alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: theme.colors.surface, borderRadius: 20,
        paddingVertical: 8, paddingHorizontal: 12,
        borderWidth: 1, borderColor: theme.colors.border,
        ...theme.shadows.base,
    },
    directionIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    directionText: { fontSize: 14, fontWeight: '700', color: theme.colors.textDark },
    colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    routeTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textDark },
});
