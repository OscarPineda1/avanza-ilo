import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles, theme } from '../styles/global-styles';
import { getRouteByName, getRouteCoordinates, getRouteSequence } from '../services/routes';
import { getEta } from '../services/eta';
import { findRoutePositionCandidates, positionFromStop } from '../services/route-position';
import { toggleFavoriteRoute, isFavoriteRoute } from '../services/favorites';
import { useNetwork } from '../context/NetworkContext';
import MapInfoCard from '../components/MapInfoCard';
import RouteMapLayers from '../components/RouteMapLayers';
import { getDisplayCoordinates } from '../services/route-sequences';

const regionIlo = {
    latitude: -17.6433,
    longitude: -71.3444,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
};

export default function MapScreen({ route, navigation }) {
    const routeName = route.params?.routeName;
    const requestedSequenceId = route.params?.sequenceId;
    const requestedWaitPointId = route.params?.waitPointId;
    const routeData = routeName ? getRouteByName(routeName) : undefined;
    const selectedSequence = routeData ? getRouteSequence(routeData.nombre, requestedSequenceId) : undefined;
    const isCircuit = selectedSequence?.kind === 'circuit';
    const coordinates = routeData ? getRouteCoordinates(routeData.nombre, selectedSequence?.id) : null;
    const displayCoordinates = useMemo(() => selectedSequence
        ? selectedSequence.layers.filter((layer) => layer.visible !== false).flatMap((layer) => getDisplayCoordinates(layer.coordinates))
        : coordinates, [coordinates, selectedSequence]);
    const { isOffline } = useNetwork();
    const mapRef = useRef(null);

    const [isFavorite, setIsFavorite] = useState(false);
    const [waitPoint, setWaitPoint] = useState(null);
    const [eta, setEta] = useState(null);

    const stops = selectedSequence?.stops || [];

    useEffect(() => {
        if (routeData) {
            isFavoriteRoute(routeData.nombre).then(setIsFavorite);
        }
    }, [routeData]);

    useEffect(() => {
        if (stops.length > 0) {
            const requestedPoint = stops.find((stop) => stop.id === requestedWaitPointId) || stops[0];
            setWaitPoint(positionFromStop(requestedPoint, selectedSequence));
        }
    }, [routeData?.nombre, selectedSequence?.id, requestedWaitPointId]);

    useEffect(() => {
        if (!waitPoint || !routeData) {
            setEta(null);
            return;
        }

        let cancelled = false;
        setEta({ minutes: 0, loading: true });

        getEta(routeData.nombre, waitPoint, selectedSequence?.id)
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
    }, [waitPoint, routeData, selectedSequence?.id]);

    const handleToggleFavorite = useCallback(async () => {
        if (!routeData) return;
        const next = await toggleFavoriteRoute(routeData.nombre);
        setIsFavorite(next);
    }, [routeData]);

    const handleSelectStop = useCallback((stop) => {
        if (selectedSequence) setWaitPoint(positionFromStop(stop, selectedSequence));
    }, [selectedSequence]);

    const handleRoutePress = useCallback((coordinate) => {
        if (!routeData || !selectedSequence) return;
        if (!Number.isFinite(coordinate?.latitude) || !Number.isFinite(coordinate?.longitude)) {
            Alert.alert('Selección no disponible', 'Usa la lista de referencias para elegir dónde esperar.');
            return;
        }
        const candidates = findRoutePositionCandidates(routeData.nombre, selectedSequence, coordinate);
        if (candidates.length === 0) {
            Alert.alert('Punto fuera del recorrido', 'Toca directamente sobre la línea de la ruta.');
            return;
        }
        if (candidates.length === 1) {
            setWaitPoint(candidates[0]);
            return;
        }
        Alert.alert(
            'Elige el paso de la ruta',
            'La ruta pasa más de una vez por este lugar. ¿En qué tramo esperarás?',
            candidates.map((candidate) => ({
                text: candidate.passageLabel,
                onPress: () => setWaitPoint(candidate),
            })).concat({ text: 'Cancelar', style: 'cancel' })
        );
    }, [routeData, selectedSequence]);

    const fitRouteToMap = useCallback(() => {
        if (displayCoordinates?.length > 1) {
            mapRef.current?.fitToCoordinates(displayCoordinates, {
                animated: false,
                edgePadding: { top: 110, right: 45, bottom: 280, left: 45 },
            });
        }
    }, [displayCoordinates]);

    return (
        <View style={globalStyles.safeArea}>
            <MapView
                ref={mapRef}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                initialRegion={regionIlo}
                showsUserLocation={true}
                onMapReady={fitRouteToMap}
            >
                <RouteMapLayers route={routeData} sequence={selectedSequence} selectedStopId={waitPoint?.id} selectedPosition={waitPoint} onStopPress={handleSelectStop} onRoutePress={handleRoutePress} />
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
                {stops.length > 0 && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Elegir punto de espera manualmente" style={styles.manualStopButton} onPress={() => navigation.navigate('StopSelection', { routeName: routeData.nombre, sequenceId: selectedSequence?.id })}>
                    <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>}
            </SafeAreaView>

            {routeData?.coordinates?.length > 1 && <View pointerEvents="none" style={styles.endpointLegend}>
                <View style={styles.endpointItem}>
                    <View style={[styles.endpointLetter, { borderColor: routeData.color }]}><Text style={[styles.endpointLetterText, isCircuit && styles.circuitEndpointLetterText, { color: routeData.color }]}>{isCircuit ? 'I/F' : 'A'}</Text></View>
                    <Text style={[styles.endpointKey, isCircuit && styles.circuitEndpointKey]}>{isCircuit ? 'Inicio y fin' : 'Inicio'}</Text>
                    <Text style={styles.endpointValue} numberOfLines={1}>{routeData.origen}</Text>
                </View>
                <View style={styles.endpointItem}>
                    <View style={[styles.endpointLetter, isCircuit && styles.returnLetter, { borderColor: routeData.color }]}><Text style={[styles.endpointLetterText, { color: routeData.color }]}>{isCircuit ? 'R' : 'B'}</Text></View>
                    <Text style={[styles.endpointKey, isCircuit && styles.circuitEndpointKey]}>{isCircuit ? 'Regreso' : 'Final'}</Text>
                    <Text style={styles.endpointValue} numberOfLines={1}>{isCircuit ? `hacia ${routeData.origen}` : routeData.destino}</Text>
                </View>
            </View>}

            {routeData && (
                <MapInfoCard
                    datosRuta={routeData}
                    hasCoordinates={stops.length > 0 || !!coordinates}
                    isOffline={isOffline}
                    eta={eta}
                    waitPointName={waitPoint?.name}
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
    endpointLegend: {
        position: 'absolute', top: 112, left: 20,
        gap: 5, maxWidth: '72%', backgroundColor: theme.colors.surface,
        borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10,
        borderWidth: 1, borderColor: theme.colors.border,
        ...theme.shadows.base,
    },
    endpointItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    endpointLetter: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1.5 },
    endpointLetterText: { fontSize: 10, fontWeight: '900' },
    circuitEndpointLetterText: { fontSize: 8 },
    returnLetter: { width: 18, height: 18, borderRadius: 9, marginHorizontal: 1 },
    endpointKey: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '800', width: 30 },
    circuitEndpointKey: { width: 54 },
    endpointValue: { color: theme.colors.textDark, fontSize: 11, fontWeight: '700', flexShrink: 1 },
    colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    routeTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textDark },
});
