import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import RouteDirectionBadge from './RouteDirectionBadge';

export default function RouteCard({ item, onPress }) {
    const isCircuit = item.sequences?.some((sequence) => sequence.id === item.defaultSequenceId && sequence.kind === 'circuit');

    return (
        <TouchableOpacity
            style={styles.routeCard}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={isCircuit
                ? `Ver circuito de la ruta ${item.nombre}, inicia y termina en ${item.origen}`
                : `Ver recorrido de la ruta ${item.nombre}, sentido ${item.origen} hacia ${item.destino}`}
            activeOpacity={0.7}
        >
            <View style={[styles.routeIcon, { backgroundColor: `${item.color}14`, borderColor: `${item.color}35` }]}>
                <Text style={[styles.routeIconText, { color: item.color }]}>{item.nombre}</Text>
            </View>
            <View style={styles.routeInfo}>
                <View style={styles.titleRow}><Text style={styles.routeName}>Ruta {item.nombre}</Text><View style={[styles.status, { backgroundColor: `${item.color}1A` }]}><Text style={[styles.statusText, { color: item.color }]}>DISPONIBLE</Text></View></View>
                <RouteDirectionBadge origin={item.origen} destination={item.destino} color={item.color} compact isCircuit={isCircuit} />
                <Text style={styles.meta}>{item.tarifa || 'Tarifa por confirmar'} · {item.frecuencia ? `Cada ${item.frecuencia}` : 'Frecuencia por confirmar'}</Text>
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
        borderWidth: 1,
    },
    routeIconText: { fontSize: 22, fontWeight: 'bold' },
    routeInfo: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    routeName: { fontSize: 18, fontWeight: '800', color: theme.colors.textDark },
    status: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '800' },
    meta: { fontSize: 13, color: theme.colors.textLight, marginTop: 4, fontWeight: '600' },
});
