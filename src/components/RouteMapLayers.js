import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Callout, Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

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

function getDirectionMarkers(coordinates) {
    if (coordinates.length < 3) return [];

    const count = coordinates.length > 25 ? 3 : 2;
    const indices = Array.from({ length: count }, (_, index) => Math.round(((index + 1) * (coordinates.length - 1)) / (count + 1)));

    return indices
        .filter((index, position) => index > 0 && index < coordinates.length - 1 && indices.indexOf(index) === position)
        .map((index) => ({ coordinate: coordinates[index], bearing: getBearing(coordinates[index - 1], coordinates[index + 1]) }));
}

function StopCallout({ title, subtitle }) {
    return <Callout><View style={styles.callout}><Text style={styles.calloutTitle}>{title}</Text><Text style={styles.calloutSubtitle}>{subtitle}</Text></View></Callout>;
}

function RouteMapLayers({ route, showStops = true, selectedStopId, onStopPress }) {
    const coordinates = route?.coordinates || [];
    const directionMarkers = useMemo(() => getDirectionMarkers(coordinates), [coordinates]);
    const firstCoordinate = coordinates[0];
    const lastCoordinate = coordinates[coordinates.length - 1];

    if (!route || coordinates.length === 0) return null;

    return <>
        <Polyline coordinates={coordinates} strokeColor="#FFFFFF" strokeWidth={showStops ? 14 : 12} lineCap="round" lineJoin="round" />
        <Polyline coordinates={coordinates} strokeColor={route.color} strokeWidth={showStops ? 7 : 6} lineCap="round" lineJoin="round" />

        {directionMarkers.map((marker, index) => <Marker key={`direction-${index}`} coordinate={marker.coordinate} anchor={{ x: .5, y: .5 }} flat rotation={marker.bearing} tracksViewChanges>
            <View style={[styles.directionMarker, { backgroundColor: route.color }]}><Ionicons name="arrow-up" size={18} color="#FFFFFF" /></View>
        </Marker>)}

        {showStops && route.stops?.filter((stop) => !stop.isOrigin && !stop.isDestination).map((stop) => {
            const isSelected = stop.id === selectedStopId;
            return <Marker key={stop.id} coordinate={stop.coordinate} anchor={{ x: .5, y: .5 }} onPress={() => onStopPress?.(stop)} tracksViewChanges={false}>
                <View style={[styles.stopMarker, { borderColor: route.color }, isSelected && { backgroundColor: route.color, transform: [{ scale: 1.16 }] }]}><Text style={[styles.stopMarkerText, isSelected && styles.stopMarkerTextSelected]}>{stop.order + 1}</Text></View>
                <StopCallout title={stop.name} subtitle={`Ruta ${route.nombre} · Toca para elegir este origen`} />
            </Marker>;
        })}

        <Marker coordinate={firstCoordinate} anchor={{ x: .5, y: .5 }} tracksViewChanges={false}>
            <View style={[styles.endpointMarker, { backgroundColor: route.color }]}><Ionicons name="flag" size={17} color="#FFFFFF" /></View>
            <StopCallout title={`Inicio · Ruta ${route.nombre}`} subtitle={route.origen} />
        </Marker>
        <Marker coordinate={lastCoordinate} anchor={{ x: .5, y: .5 }} tracksViewChanges={false}>
            <View style={[styles.endpointMarker, styles.destinationMarker, { borderColor: route.color }]}><Ionicons name="checkmark" size={18} color={route.color} /></View>
            <StopCallout title={`Final · Ruta ${route.nombre}`} subtitle={route.destino} />
        </Marker>
    </>;
}

const styles = StyleSheet.create({
    directionMarker: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF', elevation: 3, shadowColor: '#000', shadowOpacity: .18, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
    stopMarker: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 3, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    stopMarkerText: { color: '#24313A', fontSize: 12, fontWeight: '800' },
    stopMarkerTextSelected: { color: '#FFFFFF' },
    endpointMarker: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF', elevation: 4, shadowColor: '#000', shadowOpacity: .22, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    destinationMarker: { backgroundColor: '#FFFFFF', borderWidth: 3 },
    callout: { minWidth: 150, padding: 4 },
    calloutTitle: { color: '#1B2730', fontSize: 14, fontWeight: '800' },
    calloutSubtitle: { color: '#63717A', fontSize: 13, marginTop: 2 },
});

export default memo(RouteMapLayers);
