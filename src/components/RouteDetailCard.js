import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

export default function RouteDetailCard({ item, onPress }) {
    return (
        <TouchableOpacity style={styles.routeCardDetail} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.cardTopRow}>
                <View style={[styles.routeBadge, { backgroundColor: item.color }]}>
                    <Ionicons name="bus" size={16} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.routeBadgeText}>Ruta {item.nombre}</Text>
                </View>
                <Text style={styles.empresaText}>{item.empresa}</Text>
            </View>

            <View style={styles.trajectoryContainer}>
                <View style={styles.nodePoint} />
                <View style={styles.nodeLine} />
                <View style={styles.nodePoint} />
                <View style={styles.trajectoryTexts}>
                    <Text style={styles.trajectoryLabel}>Desde: <Text style={styles.trajectoryValue}>{item.origen}</Text></Text>
                    <Text style={[styles.trajectoryLabel, { marginTop: 12 }]}>Hacia: <Text style={styles.trajectoryValue}>{item.destino}</Text></Text>
                </View>
            </View>

            <View style={styles.cardAction}>
                <Text style={styles.actionText}>Ver recorrido en mapa</Text>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    routeCardDetail: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 18, marginBottom: 16, ...theme.shadows.base },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    routeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    routeBadgeText: { fontSize: 15, fontWeight: 'bold', color: theme.colors.surface },
    empresaText: { fontSize: 13, fontWeight: '600', color: theme.colors.textMuted },
    trajectoryContainer: { flexDirection: 'row', backgroundColor: theme.colors.background, padding: 14, borderRadius: 14, marginBottom: 16, position: 'relative' },
    nodePoint: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary, marginRight: 12, marginTop: 4 },
    nodeLine: { position: 'absolute', left: 18, top: 22, bottom: 22, width: 2, backgroundColor: '#D0E3FF' },
    trajectoryTexts: { flex: 1 },
    trajectoryLabel: { fontSize: 13, color: '#777', fontWeight: '500' },
    trajectoryValue: { fontSize: 15, color: theme.colors.textDark, fontWeight: '700' },
    cardAction: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14 },
    actionText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary, marginRight: 6 },
});