import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/global-styles';

// Directorio de rutas (Datos maestros para tu tesis)
const rutasDirectorio = [
    { id: '1', nombre: '1A', origen: 'Alto Ilo', destino: 'Pampa Inalámbrica', color: '#1267FF', empresa: 'Consorcio Ilo 1A', zona: 'Pampa' },
    { id: '2', nombre: 'D', origen: 'Plaza de Armas', destino: 'Ciudad Nueva', color: '#FF3644', empresa: 'Transportes Pampa I.', zona: 'Centro' },
    { id: '3', nombre: '14', origen: 'Mercado Pacocha', destino: 'Tren al Sur', color: '#2ECC71', empresa: 'Ruta Troncal 14', zona: 'Sur' },
    { id: '4', nombre: '10', origen: 'Miramar', destino: 'Nuevo Ilo', color: '#9B59B6', empresa: 'Expreso Ilo', zona: 'Pampa' },
];

const filtros = ['Todas', 'Pampa', 'Centro', 'Sur'];

export default function ExploreRoutesScreen({ navigation }) {
    const [filtroActivo, setFiltroActivo] = useState('Todas');

    const rutasMostradas = rutasDirectorio.filter(ruta =>
        filtroActivo === 'Todas' ? true : ruta.zona === filtroActivo
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={globalStyles.header}>
                <Text style={globalStyles.title}>Directorio de Rutas</Text>
                <Text style={globalStyles.subtitle}>Conoce los recorridos de Ilo</Text>
            </View>

            {/* Filtros */}
            <View style={styles.filterContainer}>
                {filtros.map((filtro, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[globalStyles.filterPill, filtroActivo === filtro && globalStyles.filterPillActive]}
                        onPress={() => setFiltroActivo(filtro)}
                    >
                        <Text style={[globalStyles.filterText, filtroActivo === filtro && globalStyles.filterTextActive]}>
                            {filtro}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Lista de Rutas */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.countText}>
                    {rutasMostradas.length} {rutasMostradas.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
                </Text>

                {rutasMostradas.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={globalStyles.routeCardDetail}
                        onPress={() => navigation.navigate('MapScreen', { routeName: item.nombre })}
                        activeOpacity={0.8}
                    >
                        <View style={[globalStyles.routeBadge, { backgroundColor: item.color }]}>
                            <Ionicons name="bus" size={16} color="#FFF" />
                            <Text style={styles.badgeText}>Ruta {item.nombre}</Text>
                        </View>

                        <Text style={globalStyles.empresaText}>{item.empresa}</Text>
                        <Text style={globalStyles.trajectoryLabel}>Desde: {item.origen}</Text>
                        <Text style={globalStyles.trajectoryLabel}>Hacia: {item.destino}</Text>

                        <Text style={styles.actionText}>Ver recorrido en mapa</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9F9F9' },
    filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
    countText: { marginBottom: 10, color: '#666', fontSize: 14 },
    badgeText: { color: '#FFF', fontWeight: 'bold', marginLeft: 6 },
    actionText: { color: '#1267FF', fontWeight: '700', marginTop: 12 }
});