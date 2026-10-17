import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../styles/global-styles';
import { useCatalog } from '../context/CatalogContext';
import { getOfficialDirectionGuide, OFFICIAL_STOPS_BY_ROUTE } from '../services/official-stops';
import ScreenHeader from '../components/ScreenHeader';

const ROUTE_NAMES = ['1A', 'D', '14'];

export default function NearbyStopsScreen({ navigation }) {
    const { routes } = useCatalog();
    const [selectedRouteName, setSelectedRouteName] = useState('1A');
    const selectedRoute = routes.find((item) => item.nombre === selectedRouteName);
    const selectedSequence = selectedRoute?.sequences.find((item) => item.id === selectedRoute.defaultSequenceId);
    const stops = OFFICIAL_STOPS_BY_ROUTE[selectedRouteName] || [];
    const groups = useMemo(() => [
        { direction: 'ida', ...getOfficialDirectionGuide(selectedRouteName, 'ida'), stops: stops.filter((item) => item.direction === 'ida') },
        { direction: 'vuelta', ...getOfficialDirectionGuide(selectedRouteName, 'vuelta'), stops: stops.filter((item) => item.direction === 'vuelta') },
    ], [stops]);

    const chooseStop = (stop) => {
        if (!selectedRoute || !selectedSequence) return;
        navigation.navigate('StopSelection', {
            routeId: selectedRoute.id,
            sequenceId: selectedSequence.id,
            suggestedWaitPointId: stop.id,
            direction: stop.direction,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Paraderos oficiales" subtitle="Elige tu ruta y el sentido del viaje" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.routeTabs}>
                    {ROUTE_NAMES.map((routeName) => {
                        const routeData = routes.find((item) => item.nombre === routeName);
                        const selected = routeName === selectedRouteName;
                        return (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityState={{ selected }}
                                key={routeName}
                                onPress={() => setSelectedRouteName(routeName)}
                                style={[styles.routeTab, selected && { backgroundColor: routeData?.color || theme.colors.primary, borderColor: routeData?.color || theme.colors.primary }]}
                            >
                                <Text style={[styles.routeTabText, selected && styles.routeTabTextSelected]}>Ruta {routeName}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {groups.map((group) => (
                    <View key={group.direction} style={styles.group}>
                        <View style={styles.groupHeader}>
                            <View style={[styles.directionIcon, { backgroundColor: `${selectedRoute?.color || theme.colors.primary}18` }]}>
                                <Ionicons name={group.direction === 'ida' ? 'arrow-forward' : 'return-down-back'} size={20} color={selectedRoute?.color || theme.colors.primary} />
                            </View>
                            <View style={styles.groupCopy}>
                                <View style={styles.groupTitleRow}>
                                    <Text style={styles.groupTitle}>{group.label}</Text>
                                    <Text style={styles.directionTag}>{group.shortLabel}</Text>
                                </View>
                                <Text style={styles.groupPath}>{group.path}</Text>
                            </View>
                        </View>
                        <View style={styles.stopList}>
                            {group.stops.map((stop, index) => (
                                <TouchableOpacity key={stop.id} onPress={() => chooseStop(stop)} disabled={!selectedRoute} style={styles.item}>
                                    <View style={[styles.order, { backgroundColor: `${selectedRoute?.color || theme.colors.primary}18` }]}>
                                        <Text style={[styles.orderText, { color: selectedRoute?.color || theme.colors.primary }]}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.copy}>
                                        <Text style={styles.stopName}>{stop.name}</Text>
                                        <Text style={styles.waitTime}>Espera promedio: {stop.dwellMinutes} min</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20, paddingBottom: 40 },
    routeTabs: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    routeTab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
    routeTabText: { color: theme.colors.textDark, fontSize: 14, fontWeight: '800' },
    routeTabTextSelected: { color: theme.colors.surface },
    group: { marginBottom: 24 },
    groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    directionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    groupCopy: { flex: 1 },
    groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    groupTitle: { color: theme.colors.textDark, fontSize: 18, fontWeight: '800' },
    directionTag: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: .5, textTransform: 'uppercase' },
    groupPath: { color: theme.colors.textMuted, fontSize: 13, marginTop: 2 },
    stopList: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
    item: { minHeight: 68, paddingHorizontal: 14, paddingVertical: 11, gap: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
    order: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    orderText: { fontSize: 14, fontWeight: '900' },
    copy: { flex: 1 },
    stopName: { color: theme.colors.textDark, fontSize: 16, fontWeight: '800' },
    waitTime: { color: theme.colors.textMuted, fontSize: 13, marginTop: 3 },
});
