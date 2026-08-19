import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

export default function LiveMapCard({ onPress }) {
    return (
        <TouchableOpacity
            style={styles.liveMapCard}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.liveMapIconContainer}>
                <Ionicons name="map" size={28} color={theme.colors.surface} />
            </View>
            <View style={styles.liveMapInfo}>
                <Text style={styles.liveMapTitle}>Explorar recorridos en el mapa</Text>
                <Text style={styles.liveMapDesc}>Ubica rutas, paraderos y sentido de viaje</Text>
            </View>
            <View style={styles.liveMapGoBtn}>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.surface} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    liveMapCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A', // Fondo oscuro nativo para alto contraste
        padding: 16,
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 20,
        ...theme.shadows.base,
    },
    liveMapIconContainer: {
        width: 50, height: 50, borderRadius: 15,
        backgroundColor: '#333333',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16,
    },
    liveMapInfo: { flex: 1 },
    liveMapTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.surface, marginBottom: 4 },
    liveMapDesc: { fontSize: 13, color: theme.colors.textLight },
    liveMapGoBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
});
