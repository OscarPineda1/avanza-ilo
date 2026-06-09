import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

export default function RouteCard({ item, onPress }) {
    return (
        <TouchableOpacity
            style={styles.routeCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.routeIcon, { backgroundColor: item.color }]}>
                <Text style={styles.routeIconText}>{item.nombre}</Text>
            </View>
            <View style={styles.routeInfo}>
                <Text style={styles.routeName}>Ruta {item.nombre}</Text>
                <Text style={styles.routeDesc}>{item.descripcion}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.border} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    routeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        ...theme.shadows.base,
    },
    routeIcon: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center', marginRight: 16,
    },
    routeIconText: { fontSize: 22, fontWeight: 'bold', color: theme.colors.surface },
    routeInfo: { flex: 1 },
    routeName: { fontSize: 18, fontWeight: '700', color: theme.colors.textDark, marginBottom: 4 },
    routeDesc: { fontSize: 14, color: theme.colors.textMuted },
});