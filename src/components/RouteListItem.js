import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import RouteBadge from './RouteBadge';
import { getOfficialDirectionGuide } from '../services/official-stops';

export default function RouteListItem({ route, onPress, favorite = false, showStatus = true }) {
    const outward = getOfficialDirectionGuide(route.nombre, 'ida');
    const returnTrip = getOfficialDirectionGuide(route.nombre, 'vuelta');
    const stopCount = route.sequences?.find((sequence) => sequence.id === route.defaultSequenceId)?.stops?.length || route.stops?.length || 0;

    return (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ruta ${route.nombre}, entre ${returnTrip.destination} y ${outward.destination}`} onPress={onPress} activeOpacity={0.8} style={styles.item}>
            <RouteBadge route={route.nombre} color={route.color} />
            <View style={styles.copy}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Ruta {route.nombre}</Text>
                    {showStatus ? <View style={styles.status}><Text style={styles.statusText}>{route.available ? 'ACTIVA' : 'OFFLINE'}</Text></View> : null}
                </View>
                <Text style={styles.direction}>{returnTrip.destination} ↔ {outward.destination}</Text>
                <Text style={styles.meta}>{route.tarifa || 'S/ 1.50'} · {stopCount} paraderos</Text>
            </View>
            <Ionicons name={favorite ? 'heart' : 'chevron-forward'} size={favorite ? 20 : 18} color={favorite ? '#E74C5E' : theme.colors.textLight} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    copy: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    title: { fontSize: 14, fontWeight: '800', color: theme.colors.textDark },
    status: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: '#EAF8F1' },
    statusText: { color: theme.colors.success, fontWeight: '800', fontSize: 9 },
    direction: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '600', marginTop: 3 },
    meta: { color: theme.colors.textLight, fontSize: 11, marginTop: 3 },
});
