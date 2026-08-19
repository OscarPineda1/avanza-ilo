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
                <View style={[styles.nodePoint, { backgroundColor: item.color }]} />
                <View style={[styles.nodeLine, { backgroundColor: `${item.color}55` }]} />
                <View style={[styles.nodePoint, { backgroundColor: item.color }]} />
                <View style={styles.trajectoryTexts}>
                    <Text style={styles.trajectoryLabel}>Desde: <Text style={styles.trajectoryValue}>{item.origen || 'Por definir'}</Text></Text>
                    <Text style={[styles.trajectoryLabel, { marginTop: 12 }]}>Hacia: <Text style={styles.trajectoryValue}>{item.destino || 'Por definir'}</Text></Text>
                </View>
            </View>

            <View style={styles.metaRow}><View style={styles.metaItem}><Ionicons name="cash-outline" size={16} color={item.color} /><Text style={styles.metaText}>{item.tarifa || 'Tarifa por definir'}</Text></View><View style={styles.metaItem}><Ionicons name="time-outline" size={16} color={item.color} /><Text style={styles.metaText}>Cada {item.frecuencia || '—'}</Text></View></View>

            <View style={styles.cardAction}>
                <Text style={[styles.actionText, { color: item.color }]}>{item.coordinates?.length ? 'Ver recorrido en mapa' : 'Ver información de la ruta'}</Text>
                <Ionicons name="arrow-forward" size={18} color={item.color} />
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
    nodePoint: { width: 10, height: 10, borderRadius: 5, marginRight: 12, marginTop: 4 },
    nodeLine: { position: 'absolute', left: 18, top: 22, bottom: 22, width: 2 },
    trajectoryTexts: { flex: 1 },
    trajectoryLabel: { fontSize: 13, color: '#777', fontWeight: '500' },
    trajectoryValue: { fontSize: 15, color: theme.colors.textDark, fontWeight: '700' },
    metaRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 9, borderRadius: 10, backgroundColor: theme.colors.background },
    metaText: { flex: 1, color: theme.colors.textMuted, fontSize: 13, fontWeight: '700' },
    cardAction: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14 },
    actionText: { fontSize: 15, fontWeight: '800', marginRight: 6 },
});
