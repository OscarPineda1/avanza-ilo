import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCatalog } from '../context/CatalogContext';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';

export default function StopSelectionScreen({ navigation, route }) {
    const { routes } = useCatalog();
    const selectedRoute = route.params?.routeId
        ? routes.find((item) => item.id === route.params.routeId)
        : routes.find((item) => item.nombre.toLowerCase() === (route.params?.routeName || '').toLowerCase());
    const selectedSequence = selectedRoute?.sequences.find((item) => item.id === (route.params?.sequenceId || selectedRoute.defaultSequenceId));
    const isCircuit = selectedSequence?.kind === 'circuit';
    const [selected, setSelected] = useState(null);
    const [query, setQuery] = useState('');
    const eligibleStops = useMemo(() => (
        selectedSequence?.stops || []
    ).filter((item) => !isCircuit || !item.isDestination), [isCircuit, selectedSequence]);
    const stops = useMemo(() => eligibleStops.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase())), [eligibleStops, query]);

    useEffect(() => {
        const suggested = eligibleStops.find((item) => item.id === route.params?.suggestedWaitPointId);
        setSelected(suggested || null);
    }, [eligibleStops, route.params?.suggestedWaitPointId]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Elige dónde esperar" subtitle={selectedSequence?.label} onBack={() => navigation.goBack()} />
            <View style={styles.tip}><Ionicons name="bulb-outline" color="#C28100" size={18} /><Text style={styles.tipText}>No necesitas activar ubicación. Son posiciones sobre el recorrido, no paraderos oficiales.</Text></View>
            <View style={styles.search}><Ionicons name="search-outline" size={19} color={theme.colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Busca una ubicación del recorrido" style={styles.input} /></View>
            <ScrollView contentContainerStyle={styles.list}>
                {stops.map((item) => <TouchableOpacity key={item.id} onPress={() => setSelected(item)} style={[styles.stop, selected?.id === item.id && styles.selectedStop]}><View style={[styles.radio, selected?.id === item.id && styles.selectedRadio]} /><View style={styles.stopCopy}><Text style={styles.stopText}>{item.name}</Text>{item.isOrigin || item.isDestination ? <Text style={styles.endpointText}>{item.isOrigin ? (isCircuit ? `I/F · INICIO Y FIN · ${selectedRoute?.origen}` : `A · INICIO · ${selectedRoute?.origen}`) : `B · FINAL · ${selectedRoute?.destino}`}</Text> : null}</View></TouchableOpacity>)}
                {!stops.length && <Text style={styles.emptyText}>Esta ruta aún no tiene ubicaciones georreferenciadas.</Text>}
            </ScrollView>
            <View style={styles.footer}>
                <AppButton disabled={!selected || !selectedRoute} label="Confirmar punto de espera" onPress={() => navigation.navigate('RouteDetails', { routeId: selectedRoute?.id, sequenceId: selectedSequence?.id, waitPointId: selected.id })} />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.surface }, tip: { margin: 20, marginBottom: 8, padding: 12, borderRadius: 10, backgroundColor: '#FFF9E9', flexDirection: 'row', gap: 9 }, tipText: { flex: 1, color: '#786017', fontSize: 14, lineHeight: 19 }, search: { height: 46, marginHorizontal: 20, borderRadius: 10, backgroundColor: theme.colors.background, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }, input: { flex: 1, fontSize: 16 }, list: { padding: 20, gap: 7, paddingBottom: 100 }, stop: { minHeight: 52, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border }, stopCopy: { flex: 1 }, selectedStop: { backgroundColor: theme.colors.primarySoft, borderRadius: 10, borderBottomWidth: 0 }, radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: theme.colors.textLight }, selectedRadio: { borderColor: theme.colors.primary, borderWidth: 5 }, stopText: { color: theme.colors.textDark, fontSize: 16 }, endpointText: { marginTop: 3, color: theme.colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: .3 }, emptyText: { color: theme.colors.textMuted, fontSize: 16, lineHeight: 22, textAlign: 'center', marginTop: 30 }, footer: { gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border } });
