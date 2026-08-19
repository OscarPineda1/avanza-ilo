import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getRouteByName } from '../services/routes';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';

const fallbackStops = ['Terminal Pampa Inalámbrica', 'Av. Andrés A. Cáceres', 'Plaza de Armas de Ilo', 'Circunvalación Sur', 'Malecón Costero', 'El Algarrobal'];
export default function StopSelectionScreen({ navigation, route }) {
    const selectedRoute = getRouteByName(route.params?.routeName || '1A');
    const [selected, setSelected] = useState(null);
    const [query, setQuery] = useState('');
    const stops = useMemo(() => (selectedRoute?.stops?.map((item) => item.name).filter((item) => !item.includes('Paradero')) || []).concat(fallbackStops).filter((value, index, array) => array.indexOf(value) === index).filter((item) => item.toLowerCase().includes(query.toLowerCase())), [query, selectedRoute]);
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Elige tu paradero" onBack={() => navigation.goBack()} />
            <View style={styles.tip}><Ionicons name="bulb-outline" color="#C28100" size={18} /><Text style={styles.tipText}>No necesitas activar ubicación. Elige el punto de partida que prefieras.</Text></View>
            <View style={styles.search}><Ionicons name="search-outline" size={19} color={theme.colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Busca un paradero por nombre" style={styles.input} /></View>
            <ScrollView contentContainerStyle={styles.list}>{stops.map((item) => <TouchableOpacity key={item} onPress={() => setSelected(item)} style={[styles.stop, selected === item && styles.selectedStop]}><View style={[styles.radio, selected === item && styles.selectedRadio]} /> <Text style={styles.stopText}>{item}</Text></TouchableOpacity>)}</ScrollView>
            <View style={styles.footer}><AppButton disabled={!selected} label="Confirmar paradero" onPress={() => navigation.navigate('RouteDetails', { routeName: selectedRoute?.nombre || '1A', originName: selected })} /></View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.surface }, tip: { margin: 20, marginBottom: 8, padding: 12, borderRadius: 10, backgroundColor: '#FFF7DC', flexDirection: 'row', gap: 9 }, tipText: { flex: 1, color: '#786017', fontSize: 12, lineHeight: 17 }, search: { height: 46, marginHorizontal: 20, borderRadius: 10, backgroundColor: theme.colors.background, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }, input: { flex: 1, fontSize: 13 }, list: { padding: 20, gap: 7, paddingBottom: 100 }, stop: { minHeight: 48, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border }, selectedStop: { backgroundColor: theme.colors.primarySoft, borderRadius: 10, borderBottomWidth: 0 }, radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: theme.colors.textLight }, selectedRadio: { borderColor: theme.colors.primary, borderWidth: 5 }, stopText: { color: theme.colors.textDark, fontSize: 14 }, footer: { padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border } });
