import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ruta1A_Coordenadas } from '../utils/rutasData';
import { globalStyles } from '../styles/global-styles';

export default function MapScreen({ route, navigation }) {
    // Recibimos los datos de la ruta seleccionada desde el HomeScreen
    const { ruta } = route.params;

    // Coordenadas aproximadas de Ilo, Moquegua
    const regionIlo = {
        latitude: -17.6433,
        longitude: -71.3444,
        latitudeDelta: 0.05, // Nivel de zoom
        longitudeDelta: 0.05,
    };

    return (

        <View style={globalStyles.container}>
            {/* El Mapa a pantalla completa */}
            <MapView
                style={globalStyles.map}
                initialRegion={regionIlo}
            >
                {/* Tu ruta dibujada */}
                <Polyline
                    coordinates={ruta1A_Coordenadas}
                    strokeColor="#2B6CB0" // El azul corporativo
                    strokeWidth={5} // Grosor visible y claro
                />

                {/* El marcador que ya tenías */}
                <Marker
                    coordinate={{ latitude: -17.6603, longitude: -71.35431 }} // Inicio de la ruta
                    title={`Paradero Inicial y final de la ${ruta.nombre}`}
                    pinColor="#E53E3E"
                />
            </MapView>

            {/* Tarjeta inferior flotante (Minimalismo Cognitivo) */}
            <SafeAreaView style={globalStyles.infoCard} edges={['bottom']}>
                <View style={globalStyles.cardContent}>
                    <Text style={globalStyles.routeTitle}>{ruta.nombre}</Text>
                    <Text style={globalStyles.routeDesc}>{ruta.descripcion}</Text>

                    <TouchableOpacity
                        style={globalStyles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={globalStyles.backButtonText}>Volver al buscador</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};