import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import { getOfficialDirectionGuide } from '../services/official-stops';

export default function RouteCard({ item, onPress }) {
    const outward = getOfficialDirectionGuide(item.nombre, 'ida');
    const returnTrip = getOfficialDirectionGuide(item.nombre, 'vuelta');
    const connection = outward.destination && returnTrip.destination
        ? `${returnTrip.destination} ↔ ${outward.destination}`
        : `${item.origen} ↔ ${item.destino}`;

    return (
        <TouchableOpacity
            style={styles.routeCard}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Ver ruta ${item.nombre}, ${connection}`}
            activeOpacity={0.7}
        >
            <View style={[styles.routeIcon, { backgroundColor: `${item.color}14`, borderColor: `${item.color}35` }]}>
                <Text style={[styles.routeIconText, { color: item.color }]}>{item.nombre}</Text>
            </View>
            <View style={styles.routeInfo}>
                <Text style={styles.routeName}>Ruta {item.nombre}</Text>
                <View style={styles.directionRow}><Ionicons name="swap-horizontal" size={15} color={item.color} /><Text style={styles.directionText}>{connection}</Text></View>
                <Text style={[styles.actionHint, { color: item.color }]}>Ver recorrido y paraderos</Text>
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
    routeName: { fontSize: 18, fontWeight: '800', color: theme.colors.textDark },
    directionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
    directionText: { flex: 1, fontSize: 13, color: theme.colors.textMuted, fontWeight: '600' },
    actionHint: { fontSize: 12, marginTop: 5, fontWeight: '800' },
});
