import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Callout, Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getDisplayCoordinates } from '../services/route-sequences';

const toRadians = (degrees) => degrees * (Math.PI / 180);
const toDegrees = (radians) => radians * (180 / Math.PI);

function getBearing(from, to) {
    const longitudeDelta = toRadians(to.longitude - from.longitude);
    const latitudeFrom = toRadians(from.latitude);
    const latitudeTo = toRadians(to.latitude);
    const y = Math.sin(longitudeDelta) * Math.cos(latitudeTo);
    const x = Math.cos(latitudeFrom) * Math.sin(latitudeTo) - Math.sin(latitudeFrom) * Math.cos(latitudeTo) * Math.cos(longitudeDelta);
    return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

function getDirectionMarkers(coordinates, isCircuit) {
    if (coordinates.length < 3) return [];

    const count = isCircuit ? 1 : coordinates.length > 25 ? 2 : 1;
    const indices = Array.from({ length: count }, (_, index) => Math.round(((index + 1) * (coordinates.length - 1)) / (count + 1)));

    return indices
        .filter((index, position) => index > 0 && index < coordinates.length - 1 && indices.indexOf(index) === position)
        .map((index) => ({ coordinate: coordinates[index], bearing: getBearing(coordinates[index - 1], coordinates[index + 1]) }));
}

function StopCallout({ title, subtitle }) {
    return <Callout><View style={styles.callout}><Text style={styles.calloutTitle}>{title}</Text><Text style={styles.calloutSubtitle}>{subtitle}</Text></View></Callout>;
}

function RouteMapLayers({ route, sequence, showStops = true, selectedStopId, selectedPosition, onStopPress, onRoutePress }) {
    const selectedSequence = sequence || route?.sequences?.find((item) => item.id === route.defaultSequenceId);
    const coordinates = selectedSequence?.coordinates || route?.coordinates || [];
    const layers = selectedSequence?.layers || [{ id: 'legacy', coordinates }];
    const visibleLayers = useMemo(() => layers
        .filter((layer) => layer.visible !== false)
        .map((layer) => ({ ...layer, displayCoordinates: getDisplayCoordinates(layer.coordinates) })), [layers]);
    const stops = selectedSequence?.stops || route?.stops || [];
    const isCircuit = selectedSequence?.kind === 'circuit';
    const directionMarkers = useMemo(() => getDirectionMarkers(visibleLayers.flatMap((layer) => layer.displayCoordinates), isCircuit), [visibleLayers, isCircuit]);
    const firstCoordinate = coordinates[0];
    const lastCoordinate = coordinates[coordinates.length - 1];
    const returnCoordinate = isCircuit && layers.length > 1
        ? layers[layers.length - 2]?.coordinates?.at(-1)
        : null;
    const [trackMarkers, setTrackMarkers] = useState(true);

    useEffect(() => {
        setTrackMarkers(true);
        const timeoutId = setTimeout(() => setTrackMarkers(false), 350);
        return () => clearTimeout(timeoutId);
    }, [route?.id, selectedSequence?.id, selectedStopId]);

    if (!route || coordinates.length === 0) return null;

    return <>
        {visibleLayers.map((layer) => <React.Fragment key={layer.id}>
            <Polyline coordinates={layer.displayCoordinates} strokeColor="#FFFFFF" strokeWidth={showStops ? 9 : 8} lineCap="round" lineJoin="round" />
            <Polyline coordinates={layer.displayCoordinates} strokeColor={route.color} strokeWidth={showStops ? 5 : 4} lineCap="round" lineJoin="round" tappable={Boolean(onRoutePress)} onPress={(event) => onRoutePress?.(event.nativeEvent.coordinate)} />
        </React.Fragment>)}

        {directionMarkers.map((marker, index) => <Marker key={`direction-${index}`} coordinate={marker.coordinate} anchor={{ x: .5, y: .5 }} flat rotation={marker.bearing} tracksViewChanges={trackMarkers}>
            <View style={[styles.directionMarker, { backgroundColor: route.color }]}><Ionicons name="arrow-up" size={13} color="#FFFFFF" /></View>
        </Marker>)}

        {showStops && stops.filter((stop) => !stop.isOrigin && !stop.isDestination && stop.id === selectedStopId).map((stop) => {
            const isSelected = stop.id === selectedStopId;
            return <Marker key={`${stop.id}-${isSelected ? 'selected' : 'idle'}`} coordinate={stop.coordinate} anchor={{ x: .5, y: .5 }} onPress={() => onStopPress?.(stop)} tracksViewChanges={trackMarkers}>
                <View style={[styles.stopMarker, { borderColor: route.color }, isSelected && { backgroundColor: route.color, transform: [{ scale: 1.16 }] }]}><Text style={[styles.stopMarkerText, isSelected && styles.stopMarkerTextSelected]}>{stop.order + 1}</Text></View>
                <StopCallout title={stop.name} subtitle={`Ruta ${route.nombre} · Toca para esperar aquí`} />
            </Marker>;
        })}

        {showStops && selectedPosition?.source === 'map' ? <Marker coordinate={selectedPosition.coordinate} anchor={{ x: .5, y: 1 }} tracksViewChanges={trackMarkers} zIndex={4}>
            <View style={[styles.selectedPin, { backgroundColor: route.color }]}><Ionicons name="location" size={17} color="#FFFFFF" /></View>
            <StopCallout title="Punto de espera elegido" subtitle={`${selectedPosition.passageLabel} · Ruta ${route.nombre}`} />
        </Marker> : null}

        {showStops ? <>
            <Marker coordinate={firstCoordinate} anchor={{ x: .5, y: .5 }} tracksViewChanges={trackMarkers} zIndex={3}>
                <View style={[styles.endpointMarker, { borderColor: route.color }]}><Text style={[styles.endpointMarkerText, isCircuit && styles.circuitEndpointText, { color: route.color }]}>{isCircuit ? 'I/F' : 'A'}</Text></View>
                <StopCallout title={`${isCircuit ? 'Inicio y fin' : 'Inicio'} · Ruta ${route.nombre}`} subtitle={route.origen} />
            </Marker>
            {isCircuit && returnCoordinate ? <Marker coordinate={returnCoordinate} anchor={{ x: .5, y: .5 }} tracksViewChanges={trackMarkers} zIndex={3}>
                <View style={[styles.returnMarker, { borderColor: route.color }]}><Text style={[styles.returnMarkerText, { color: route.color }]}>R</Text></View>
                <StopCallout title={`Regreso · Ruta ${route.nombre}`} subtitle={`Desde aquí vuelve hacia ${route.origen}`} />
            </Marker> : <Marker coordinate={lastCoordinate} anchor={{ x: .5, y: .5 }} tracksViewChanges={trackMarkers} zIndex={3}>
                <View style={[styles.endpointMarker, { borderColor: route.color }]}><Text style={[styles.endpointMarkerText, { color: route.color }]}>B</Text></View>
                <StopCallout title={`Final · Ruta ${route.nombre}`} subtitle={route.destino} />
            </Marker>}
        </> : null}
    </>;
}

const styles = StyleSheet.create({
    directionMarker: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF', opacity: .82, elevation: 2 },
    stopMarker: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 3, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    stopMarkerText: { color: '#24313A', fontSize: 12, fontWeight: '800' },
    stopMarkerTextSelected: { color: '#FFFFFF' },
    endpointMarker: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 2, elevation: 3 },
    endpointMarkerText: { fontSize: 14, fontWeight: '900' },
    circuitEndpointText: { fontSize: 11 },
    returnMarker: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 2, elevation: 3 },
    returnMarkerText: { fontSize: 12, fontWeight: '900' },
    selectedPin: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF', elevation: 3 },
    callout: { minWidth: 150, padding: 4 },
    calloutTitle: { color: '#1B2730', fontSize: 14, fontWeight: '800' },
    calloutSubtitle: { color: '#63717A', fontSize: 13, marginTop: 2 },
});

export default memo(RouteMapLayers);
