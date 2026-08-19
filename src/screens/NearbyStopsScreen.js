import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import { getPilotRoutes } from '../services/routes';
import ScreenHeader from '../components/ScreenHeader';

const stops = getPilotRoutes().flatMap((route) => route.stops.map((stop) => ({ ...stop, color: route.color }))).slice(0, 18);
export default function NearbyStopsScreen({ navigation }) {
    return <SafeAreaView style={styles.safeArea}><ScreenHeader title="Paraderos disponibles" subtitle="Selecciona una ruta y elige tu punto de partida" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content}>{stops.map((stop) => <TouchableOpacity key={stop.id} onPress={() => navigation.navigate('StopSelection', { routeName: stop.routeName })} style={styles.item}><View style={[styles.icon, { backgroundColor: `${stop.color}18` }]}><Ionicons name="bus-outline" size={21} color={stop.color} /></View><View style={styles.copy}><Text style={styles.title}>{stop.name}</Text><Text style={styles.meta}>Ruta {stop.routeName} · Paradero {stop.order + 1}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} /></TouchableOpacity>)}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: 20, gap: 10, paddingBottom: 32 }, item: { padding: 14, gap: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border }, icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1 }, title: { color: theme.colors.textDark, fontSize: 16, fontWeight: '800' }, meta: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4 } });
