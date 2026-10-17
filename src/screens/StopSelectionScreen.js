import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useCatalog } from '../context/CatalogContext';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';
import { getOfficialDirectionGuide, OFFICIAL_STOPS_BY_ROUTE } from '../services/official-stops';

export default function StopSelectionScreen({ navigation, route }) {
    const { routes } = useCatalog();
    const selectedRoute = route.params?.routeId
        ? routes.find((item) => item.id === route.params.routeId)
        : routes.find((item) => item.nombre.toLowerCase() === (route.params?.routeName || '').toLowerCase());
    const selectedSequence = selectedRoute?.sequences.find((item) => item.id === (route.params?.sequenceId || selectedRoute.defaultSequenceId));
    const [selected, setSelected] = useState(null);
    const [query, setQuery] = useState('');
    const [direction, setDirection] = useState(route.params?.direction || 'ida');

    const eligibleStops = useMemo(() => {
        if (!selectedRoute || !selectedSequence) return [];
        const definitions = OFFICIAL_STOPS_BY_ROUTE[selectedRoute.nombre];
        if (!definitions) return selectedSequence.stops || [];
        return definitions.map((stop, order) => ({
            ...stop,
            routeName: selectedRoute.nombre,
            sequenceId: selectedSequence.id,
            order,
            isOrigin: false,
            isDestination: false,
            official: true,
        }));
    }, [selectedRoute, selectedSequence]);

    const directionOptions = useMemo(() => ['ida', 'vuelta'].map((value) => ({
        value,
        ...getOfficialDirectionGuide(selectedRoute?.nombre, value),
    })), [selectedRoute?.nombre]);
    const activeGuide = directionOptions.find((item) => item.value === direction);
    const stops = useMemo(() => eligibleStops.filter((item) => item.direction === direction && item.name.toLowerCase().includes(query.trim().toLowerCase())), [direction, eligibleStops, query]);

    useEffect(() => {
        const suggested = eligibleStops.find((item) => item.id === route.params?.suggestedWaitPointId);
        setSelected(suggested || null);
        if (suggested?.direction) setDirection(suggested.direction);
    }, [eligibleStops, route.params?.suggestedWaitPointId]);

    const changeDirection = (nextDirection) => {
        setDirection(nextDirection);
        setSelected(null);
        setQuery('');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Elige dónde esperar" subtitle={selectedRoute ? `Ruta ${selectedRoute.nombre} · ${activeGuide?.label || ''}` : undefined} onBack={() => navigation.goBack()} />
            <View style={styles.directionPicker}>
                <Text style={styles.question}>¿Hacia dónde vas?</Text>
                <View style={styles.directionOptions}>
                    {directionOptions.map((option) => {
                        const active = option.value === direction;
                        return (
                            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: active }} key={option.value} onPress={() => changeDirection(option.value)} style={[styles.directionOption, active && styles.directionOptionActive]}>
                                <Ionicons name={option.value === 'ida' ? 'arrow-forward' : 'return-down-back'} size={18} color={active ? theme.colors.surface : theme.colors.primary} />
                                <View style={styles.directionCopy}>
                                    <Text style={[styles.directionLabel, active && styles.directionLabelActive]}>{option.label}</Text>
                                    <Text style={[styles.directionPath, active && styles.directionPathActive]}>{option.path}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            <View style={styles.search}><Ionicons name="search-outline" size={19} color={theme.colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Busca un paradero" style={styles.input} /></View>
            <ScrollView contentContainerStyle={styles.list}>
                {stops.map((item, index) => (
                    <TouchableOpacity key={item.id} onPress={() => setSelected(item)} style={[styles.stop, selected?.id === item.id && styles.selectedStop]}>
                        <View style={[styles.stopOrder, selected?.id === item.id && styles.stopOrderSelected]}><Text style={[styles.stopOrderText, selected?.id === item.id && styles.stopOrderTextSelected]}>{index + 1}</Text></View>
                        <View style={styles.stopCopy}><Text style={styles.stopText}>{item.name}</Text><Text style={styles.endpointText}>Espera promedio: {item.dwellMinutes} min</Text></View>
                        <Ionicons name={selected?.id === item.id ? 'checkmark-circle' : 'ellipse-outline'} size={21} color={selected?.id === item.id ? theme.colors.primary : theme.colors.textLight} />
                    </TouchableOpacity>
                ))}
                {!stops.length && <Text style={styles.emptyText}>No encontramos paraderos con ese nombre.</Text>}
            </ScrollView>
            <View style={styles.footer}>
                <AppButton disabled={!selected || !selectedRoute} label="Confirmar punto de espera" onPress={() => navigation.navigate('RouteDetails', { routeId: selectedRoute?.id, sequenceId: selectedSequence?.id, waitPointId: selected.id, waitPoint: selected })} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.surface },
    directionPicker: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 },
    question: { color: theme.colors.textDark, fontSize: 16, fontWeight: '800', marginBottom: 10 },
    directionOptions: { gap: 8 },
    directionOption: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, backgroundColor: theme.colors.surface },
    directionOptionActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    directionCopy: { flex: 1 },
    directionLabel: { color: theme.colors.textDark, fontSize: 15, fontWeight: '800' },
    directionLabelActive: { color: theme.colors.surface },
    directionPath: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
    directionPathActive: { color: '#E4F4EF' },
    search: { height: 46, marginHorizontal: 20, marginTop: 4, borderRadius: 10, backgroundColor: theme.colors.background, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
    input: { flex: 1, fontSize: 16 },
    list: { padding: 20, gap: 7, paddingBottom: 100 },
    stop: { minHeight: 58, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    stopCopy: { flex: 1 },
    selectedStop: { backgroundColor: theme.colors.primarySoft, borderRadius: 10, borderBottomWidth: 0 },
    stopOrder: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
    stopOrderSelected: { backgroundColor: theme.colors.primary },
    stopOrderText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '900' },
    stopOrderTextSelected: { color: theme.colors.surface },
    stopText: { color: theme.colors.textDark, fontSize: 16 },
    endpointText: { marginTop: 3, color: theme.colors.textMuted, fontSize: 12 },
    emptyText: { color: theme.colors.textMuted, fontSize: 16, lineHeight: 22, textAlign: 'center', marginTop: 30 },
    footer: { gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
});
