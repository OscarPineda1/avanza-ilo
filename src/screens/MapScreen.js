import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Importaciones de tu arquitectura limpia
import { globalStyles, theme } from '../styles/global-styles';
import { ruta1A_Coordenadas } from '../utils/ruta1A.js';
import MapInfoCard from '../components/MapInfoCard'; // <-- Tu nuevo componente

const { width, height } = Dimensions.get('window');

// Datos maestros temporales
const infoRutas = {
    '1A': { horario: '6:00 AM - 9:00 PM', tarifa: 'S/. 1.50', frecuencia: '10 min', color: theme.colors.ruta1A, empresa: 'Consorcio Ilo 1A' },
    'D': { horario: '6:15 AM - 8:45 PM', tarifa: 'S/. 1.50', frecuencia: '12 min', color: theme.colors.rutaD, empresa: 'Transportes Pampa I.' },
    '14': { horario: '6:00 AM - 9:00 PM', tarifa: 'S/. 1.70', frecuencia: '15 min', color: theme.colors.ruta14, empresa: 'Ruta Troncal 14' },
};

export default function MapScreen({ route, navigation }) {
    const { routeName } = route.params || { routeName: '1A' };
    const datosRuta = infoRutas[routeName] || infoRutas['1A'];

    const [isFavorite, setIsFavorite] = useState(false);

    const regionIlo = {
        latitude: -17.6433,
        longitude: -71.3444,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
    };

    return (
        <View style={globalStyles.safeArea}>
            {/* 1. MAPA EN ÁREA SUPERIOR */}
            <MapView
                style={styles.map}
                initialRegion={regionIlo}
                showsUserLocation={true}
            >
                {routeName === '1A' && (
                    <Polyline
                        coordinates={ruta1A_Coordenadas}
                        strokeColor={datosRuta.color}
                        strokeWidth={5}
                    />
                )}
                <Marker
                    coordinate={{ latitude: -17.6603, longitude: -71.35431 }}
                    title={`Paradero Inicial/Final - Ruta ${routeName}`}
                    pinColor={theme.colors.danger}
                />
            </MapView>

            {/* BOTÓN DE RETORNO FLOTANTE SUPERIOR */}
            <SafeAreaView style={styles.topOverlay}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
                </TouchableOpacity>
                <View style={styles.routeHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: datosRuta.color }]} />
                    <Text style={styles.routeTitle}>Ruta {routeName}</Text>
                </View>
            </SafeAreaView>

            {/* 2. TARJETA INFERIOR (LLAMANDO AL COMPONENTE REUTILIZABLE) */}
            <MapInfoCard
                routeName={routeName}
                datosRuta={datosRuta}
                isFavorite={isFavorite}
                onToggleFavorite={() => setIsFavorite(!isFavorite)}
            />
        </View>
    );
}

// Únicamente los estilos locales que controlan el mapa y los botones flotantes superiores
const styles = StyleSheet.create({
    map: {
        width: width,
        height: height * 0.58, // Deja espacio exacto para la tarjeta
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