import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Importamos tus Estilos Globales y tus Componentes Reutilizables
import { globalStyles, theme } from '../styles/global-styles';
import { getAvailableRoutes } from '../services/routes';
import RouteCard from '../components/RouteCard';
import LiveMapCard from '../components/LiveMapCard'; // Asegúrate de tener este componente creado

// Datos centralizados de las rutas piloto
const rutasDisponibles = getAvailableRoutes();

export default function HomeScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filtrado de rutas
    const rutasFiltradas = rutasDisponibles.filter(ruta =>
        ruta.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ruta.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const irAlMapaVivo = () => {
        navigation.navigate('MapScreen');
    };

    const irAlMapa = (rutaName) => {
        navigation.navigate('MapScreen', { routeName: rutaName });
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>

            <ScrollView
                style={globalStyles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* ENCABEZADO (Usando estilos globales) */}
                <View style={styles.header}>
                    <Text style={globalStyles.headerTitle}>Avanza Ilo</Text>
                    <Text style={globalStyles.subtitle}>¿A dónde te diriges hoy?</Text>
                </View>

                {/* BARRA DE BÚSQUEDA (Estilo local porque es único de esta pantalla) */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={24} color={theme.colors.primary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar ruta (ej. 1A, D, 14)..."
                        placeholderTextColor={theme.colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.border} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* LISTA DE RUTAS (Mapeada con tu Componente Reutilizable RouteCard) */}
                <Text style={globalStyles.sectionTitle}>Rutas Piloto Disponibles</Text>

                {rutasFiltradas.length > 0 ? (
                    rutasFiltradas.map((item) => (
                        <RouteCard
                            key={item.id}
                            item={item}
                            onPress={() => irAlMapa(item.nombre)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No se encontraron rutas.</Text>
                    </View>
                )}

                {/* TARJETA: EXPLORAR MAPA EN VIVO (Componente Reutilizable) */}
                <LiveMapCard onPress={irAlMapaVivo} />

            </ScrollView>

        </SafeAreaView>
    );
}

// Estos son LOS ÚNICOS estilos que se quedan aquí, porque pertenecen solo al buscador
const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
        marginTop: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        marginBottom: 24,
        ...theme.shadows.base, // Reutilizando la sombra global
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        color: theme.colors.textDark,
        fontWeight: '500',
    },
    clearIcon: {
        padding: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        color: theme.colors.textLight,
        fontSize: 16,
    },
});