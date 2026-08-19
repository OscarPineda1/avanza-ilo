import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

export default function RouteCard({ item, onPress }) {
    return (
        <TouchableOpacity
            style={styles.routeCard}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Ver recorrido de la ruta ${item.nombre}`}
            activeOpacity={0.7}
        >
            <View style={[styles.routeIcon, { backgroundColor: item.color }]}>
                <Text style={styles.routeIconText}>{item.nombre}</Text>
            </View>
            <View style={styles.routeInfo}>
                <View style={styles.titleRow}><Text style={styles.routeName}>Ruta {item.nombre}</Text><View style={[styles.status, { backgroundColor: `${item.color}1A` }]}><Text style={[styles.statusText, { color: item.color }]}>DISPONIBLE</Text></View></View>
                <Text style={styles.routeDesc} numberOfLines={1}>{item.origen} <Text style={styles.arrow}>→</Text> {item.destino}</Text>
                <Text style={styles.meta}>{item.tarifa} · Cada {item.frecuencia}</Text>
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
        borderWidth: 1, borderColor: theme.colors.border,
        ...theme.shadows.base,
    },
    routeIcon: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center', marginRight: 16,
    },
    routeIconText: { fontSize: 22, fontWeight: 'bold', color: theme.colors.surface },
    routeInfo: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    routeName: { fontSize: 18, fontWeight: '800', color: theme.colors.textDark },
    status: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '800' },
    routeDesc: { fontSize: 14, color: theme.colors.textMuted },
    arrow: { color: theme.colors.primary, fontWeight: '800' },
    meta: { fontSize: 13, color: theme.colors.textLight, marginTop: 4, fontWeight: '600' },
});
