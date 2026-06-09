import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// IMPORTAMOS TUS COMPONENTES REUTILIZABLES Y ESTILOS
import { globalStyles, theme } from '../styles/global-styles';
import BottomNavbar from '../components/BottomNavbar';
import RouteDetailCard from '../components/RouteDetailCard';

// Datos extendidos para la exploración de rutas (RF-03)
const rutasDirectorio = [
    { id: '1', nombre: '1A', origen: 'Alto Ilo', destino: 'Pampa Inalámbrica', color: '#1267FF', empresa: 'Consorcio Ilo 1A', zona: 'Pampa' },
    { id: '2', nombre: 'D', origen: 'Plaza de Armas', destino: 'Ciudad Nueva', color: '#FF3644', empresa: 'Transportes Pampa I.', zona: 'Centro' },
    { id: '3', nombre: '14', origen: 'Mercado Pacocha', destino: 'Tren al Sur', color: '#2ECC71', empresa: 'Ruta Troncal 14', zona: 'Sur' },
    { id: '4', nombre: '10', origen: 'Miramar', destino: 'Nuevo Ilo', color: '#9B59B6', empresa: 'Expreso Ilo', zona: 'Pampa' },
];

const filtros = ['Todas', 'Pampa', 'Centro', 'Sur'];

export default function ExploreRoutesScreen({ navigation }) {
    const [filtroActivo, setFiltroActivo] = useState('Todas');

    // Filtrado de rutas según la zona seleccionada
    const rutasMostradas = rutasDirectorio.filter(ruta =>
        filtroActivo === 'Todas' ? true : ruta.zona === filtroActivo
    );

    const irAlMapa = (rutaName) => {
        navigation.navigate('MapScreen', { routeName: rutaName });
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>

            {/* HEADER PRINCIPAL (Usando estilos globales combinados con locales) */}
            <View style={styles.header}>
                <Text style={globalStyles.headerTitle}>Directorio de Rutas</Text>
                <Text style={globalStyles.subtitle}>Conoce los recorridos de Ilo</Text>
            </View>

            {/* FILTROS POR ZONA */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {filtros.map((filtro, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.filterPill,
                                filtroActivo === filtro && styles.filterPillActive
                            ]}
                            onPress={() => setFiltroActivo(filtro)}
                        >
                            <Text style={[
                                styles.filterText,
                                filtroActivo === filtro && styles.filterTextActive
                            ]}>
                                {filtro}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* LISTA DE RUTAS DETALLADA (Usando tu componente limpio) */}
            <ScrollView
                style={globalStyles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                <Text style={globalStyles.sectionTitle}>
                    {rutasMostradas.length} {rutasMostradas.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
                </Text>

                {rutasMostradas.map((item) => (
                    <RouteDetailCard
                        key={item.id}
                        item={item}
                        onPress={() => irAlMapa(item.nombre)}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

// ESTILOS LOCALES (Solo guardamos aquí lo que es EXCLUSIVO de esta pantalla, como las píldoras de filtro)
const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: theme.colors.surface,
    },
    filterContainer: {
        backgroundColor: theme.colors.surface,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginBottom: 10,
    },
    filterScroll: {
        paddingHorizontal: 20
    },
    filterPill: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        marginRight: 10,
    },
    filterPillActive: {
        backgroundColor: theme.colors.textDark
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textMuted
    },
    filterTextActive: {
        color: theme.colors.surface
    },
});