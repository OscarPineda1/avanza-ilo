import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles, theme } from '../styles/global-styles';
import { getRouteByName, getRouteCoordinates } from '../services/routes';
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

    const [isFavorite, setIsFavorite] = useState(false);

    const startCoordinate = coordinates?.[0];

    return (
        <View style={globalStyles.safeArea}>
            {/* 1. MAPA EN ÁREA SUPERIOR */}
            <MapView
                style={styles.map}
                initialRegion={regionIlo}
                showsUserLocation={true}
            >
                {coordinates && (
                    <Polyline
                        coordinates={coordinates}
                        strokeColor={routeData.color}
                        strokeWidth={5}
                    />
                )}

                {startCoordinate && (
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

            {/* BOTÓN DE RETORNO FLOTANTE SUPERIOR */}
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

            {/* 2. TARJETA INFERIOR (LLAMANDO AL COMPONENTE REUTILIZABLE) */}
            {routeData && (
                <MapInfoCard
                    datosRuta={routeData}
                    hasCoordinates={!!coordinates}
                    isFavorite={isFavorite}
                    onToggleFavorite={() => setIsFavorite(!isFavorite)}
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
