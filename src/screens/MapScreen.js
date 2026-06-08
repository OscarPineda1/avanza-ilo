import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ruta1A_Coordenadas } from '../utils/rutasData';

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
        <View style={styles.container}>
            {/* El Mapa a pantalla completa */}
            <MapView
                style={styles.map}
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
            <SafeAreaView style={styles.infoCard} edges={['bottom']}>
                <View style={styles.cardContent}>
                    <Text style={styles.routeTitle}>{ruta.nombre}</Text>
                    <Text style={styles.routeDesc}>{ruta.descripcion}</Text>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Volver al buscador</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    infoCard: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    cardContent: {
        padding: 25,
        alignItems: 'center',
    },
    routeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    routeDesc: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 15,
    },
    backButton: {
        backgroundColor: '#E2E8F0',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#2D3748',
        fontSize: 16,
        fontWeight: '600',
    }
});