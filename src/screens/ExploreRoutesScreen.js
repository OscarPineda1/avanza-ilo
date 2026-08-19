import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/global-styles';
import { getAllRoutes } from '../services/routes';
import RouteDetailCard from '../components/RouteDetailCard';
import EmptyState from '../components/EmptyState';

const filtros = ['Todas', 'Pampa', 'Centro', 'Sur'];

export default function ExploreRoutesScreen({ navigation }) {
    const [filtroActivo, setFiltroActivo] = useState('Todas');

    const rutasDirectorio = getAllRoutes();
    const rutasMostradas = rutasDirectorio.filter(ruta =>
        filtroActivo === 'Todas' ? true : ruta.zona === filtroActivo
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={globalStyles.header}>
                <Text style={globalStyles.title}>Directorio de Rutas</Text>
                <Text style={globalStyles.subtitle}>Compara recorridos, horarios y tarifas antes de salir.</Text>
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

                {rutasMostradas.length ? rutasMostradas.map((item) => (
                    <RouteDetailCard
                        key={item.id}
                        item={item}
                        onPress={() => navigation.navigate(item.coordinates?.length ? 'RouteDetails' : 'Status', item.coordinates?.length ? { routeName: item.nombre } : { type: 'offline', routeName: item.nombre })}
                    />
                )) : <EmptyState icon="bus-outline" title="No hay rutas en esta zona" message="Prueba con otro filtro para ver los recorridos disponibles." actionLabel="Ver todas" onAction={() => setFiltroActivo('Todas')} />}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9F9F9' },
    filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
    countText: { marginBottom: 10, color: '#666', fontSize: 14 },
});
