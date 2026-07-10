import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { globalStyles, theme } from '../styles/global-styles';
import { getRouteByName, getRouteCoordinates } from '../services/routes';
import { getEta } from '../services/eta';
import { toggleFavoriteRoute, isFavoriteRoute } from '../services/favorites';
import { useNetwork } from '../context/NetworkContext';
import MapInfoCard from '../components/MapInfoCard';

const { width, height } = Dimensions.get('window');

const regionIlo = {
    latitude: -17.6433,
    longitude: -71.3444,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
};

export default function MapScreen({ route, navigation }) {
    const routeName = route.params?.routeName;
    const routeData = routeName ? getRouteByName(routeName) : undefined;
    const coordinates = routeData ? getRouteCoordinates(routeData.nombre) : null;
    const { isOffline } = useNetwork();

    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedStop, setSelectedStop] = useState(null);
    const [destinationStop, setDestinationStop] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [eta, setEta] = useState(null);

    const stops = routeData?.stops || [];

    useEffect(() => {
        if (routeData) {
            isFavoriteRoute(routeData.nombre).then(setIsFavorite);
        }
    }, [routeData]);

    useEffect(() => {
        if (stops.length > 0) {
            setDestinationStop(stops[stops.length - 1]);
            setSelectedStop(stops[0]);
        }
    }, [stops]);

    useEffect(() => {
        let subscriber = null;
        let unmounted = false;

        async function requestLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (unmounted) return;
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'No se pudo acceder a la ubicación. Puedes seleccionar un paradero manualmente.');
                return;
            }

            const initial = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            if (unmounted) return;
            setUserLocation(initial.coords);

            const watcher = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 50, timeInterval: 5000 },
                (location) => {
                    if (!unmounted) {
                        setUserLocation(location.coords);
                    }
                }
            );
            if (unmounted) {
                watcher.remove();
                return;
            }
            subscriber = watcher;
        }

        requestLocation();

        return () => {
            unmounted = true;
            if (subscriber) {
                subscriber.remove();
            }
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

    const startCoordinate = coordinates?.[0];

    return (
        <View style={globalStyles.safeArea}>
            <MapView
                style={styles.map}
                initialRegion={regionIlo}
                showsUserLocation={true}
                followsUserLocation={true}
            >
                {coordinates && (
                    <Polyline
                        coordinates={coordinates}
                        strokeColor={routeData.color}
                        strokeWidth={5}
                    />
                )}

                {stops.map((stop) => (
                    <Marker
                        key={stop.id}
                        coordinate={stop.coordinate}
                        pinColor={selectedStop?.id === stop.id ? theme.colors.primary : theme.colors.danger}
                        onPress={() => handleSelectStop(stop)}
                    >
                        <Callout>
                            <Text>{stop.name} - Ruta {stop.routeName}</Text>
                        </Callout>
                    </Marker>
                ))}

                {startCoordinate && stops.length === 0 && (
                    <Marker
                        coordinate={startCoordinate}
                        pinColor={theme.colors.danger}
                    >
                        <Callout>
                            <Text>Paradero Inicial - Ruta {routeData.nombre}</Text>
                        </Callout>
                    </Marker>
                )}
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
            </SafeAreaView>

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
        width: width,
        height: height * 0.58,
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
    colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    routeTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textDark },
});
