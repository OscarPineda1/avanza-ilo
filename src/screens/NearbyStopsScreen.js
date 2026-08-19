import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';

const stops = [{ name: 'Terminal Pampa Inalámbrica', distance: '250 m', route: '1A' }, { name: 'Plaza de Armas', distance: '450 m', route: 'D' }, { name: 'Malecón Costero', distance: '800 m', route: '14' }];
export default function NearbyStopsScreen({ navigation }) {
    return <SafeAreaView style={styles.safeArea}><ScreenHeader title="Paraderos Cercanos" subtitle="Encontramos 3 paraderos a tu alrededor" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content}>{stops.map((stop) => <TouchableOpacity key={stop.name} onPress={() => navigation.navigate('StopSelection', { routeName: stop.route })} style={styles.item}><View style={styles.icon}><Ionicons name="bus-outline" size={21} color={theme.colors.primary} /></View><View style={styles.copy}><Text style={styles.title}>{stop.name}</Text><Text style={styles.meta}>{stop.distance} · Ruta {stop.route}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} /></TouchableOpacity>)}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: 20, gap: 10 }, item: { padding: 14, gap: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border }, icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }, copy: { flex: 1 }, title: { color: theme.colors.textDark, fontSize: 14, fontWeight: '800' }, meta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 } });
