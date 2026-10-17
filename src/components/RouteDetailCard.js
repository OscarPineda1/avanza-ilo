import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import { getOfficialDirectionGuide } from '../services/official-stops';

export default function RouteDetailCard({ item, onPress }) {
    const outward = getOfficialDirectionGuide(item.nombre, 'ida');
    const returnTrip = getOfficialDirectionGuide(item.nombre, 'vuelta');
    const stopCount = item.sequences?.find((sequence) => sequence.id === item.defaultSequenceId)?.stops?.length || item.stops?.length || 0;

    return (
        <TouchableOpacity style={styles.routeCardDetail} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.cardTopRow}>
                <View style={[styles.routeBadge, { backgroundColor: item.color }]}>
                    <Ionicons name="bus" size={16} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.routeBadgeText}>Ruta {item.nombre}</Text>
                </View>
                <View style={styles.farePill}><Text style={styles.fareText}>{item.tarifa || 'S/ 1.50'}</Text></View>
            </View>

            <View style={styles.trajectoryContainer}>
                <Ionicons name="swap-horizontal" size={22} color={item.color} />
                <View style={styles.trajectoryTexts}><Text style={styles.trajectoryValue}>{returnTrip.destination} ↔ {outward.destination}</Text><Text style={styles.trajectoryLabel}>{stopCount} paraderos oficiales</Text></View>
            </View>

            <View style={styles.cardAction}>
                <Text style={[styles.actionText, { color: item.color }]}>Ver recorrido y paraderos</Text>
                <Ionicons name="arrow-forward" size={18} color={item.color} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    routeCardDetail: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 18, marginBottom: 16, ...theme.shadows.base },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    routeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    routeBadgeText: { fontSize: 15, fontWeight: 'bold', color: theme.colors.surface },
    farePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.colors.background },
    fareText: { fontSize: 13, fontWeight: '800', color: theme.colors.textDark },
    trajectoryContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.background, padding: 14, borderRadius: 14, marginBottom: 16 },
    trajectoryTexts: { flex: 1 },
    trajectoryLabel: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '600', marginTop: 3 },
    trajectoryValue: { fontSize: 15, color: theme.colors.textDark, fontWeight: '700' },
    cardAction: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14 },
    actionText: { fontSize: 15, fontWeight: '800', marginRight: 6 },
});
