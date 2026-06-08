import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tus "Datos Maestros" locales (Cero latencia de red, según HU-02)
const RUTAS_PILOTO = [
    { id: '1', nombre: 'Ruta 1A', descripcion: 'Pampa Inalámbrica - Puerto' },
    { id: '2', nombre: 'Ruta D', descripcion: 'Mercado Pacocha - Terminal' },
    { id: '3', nombre: 'Ruta 14', descripcion: 'Alto Ilo - Ciudad Nueva' },
];

export default function HomeScreen({ navigation }) {
    // Estados lógicos de React
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRoutes, setFilteredRoutes] = useState([]);

    // Función que se ejecuta cada vez que el usuario teclea algo
    const handleSearch = (text) => {
        setSearchQuery(text);
        // Si la barra está vacía, limpiamos los resultados
        if (text.trim() === '') {
            setFilteredRoutes([]);
        } else {
            // Filtramos el arreglo local ignorando mayúsculas y minúsculas
            const filtered = RUTAS_PILOTO.filter((ruta) =>
                ruta.nombre.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredRoutes(filtered);
        }
    };

    // Función que se ejecuta al tocar una opción sugerida
    const handleSelectRoute = (ruta) => {
        setSearchQuery(ruta.nombre); // Rellena el buscador con la selección
        setFilteredRoutes([]); // Oculta la lista
        // ¡Aquí conectaremos con el Mapa y Dijkstra más adelante!
        navigation.navigate('Map', { ruta: ruta });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <Text style={styles.title}>Avanza Ilo</Text>
                <Text style={styles.subtitle}>Encuentra tu ruta en un solo toque</Text>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Busca tu ruta (ej. 1A, D, 14)..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                    />

                    {/* Renderizado Condicional: Solo aparece si hay coincidencias */}
                    {filteredRoutes.length > 0 && (
                        <View style={styles.listContainer}>
                            <FlatList
                                data={filteredRoutes}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.routeItem}
                                        onPress={() => handleSelectRoute(item)}
                                    >
                                        <Text style={styles.routeName}>{item.nombre}</Text>
                                        <Text style={styles.routeDesc}>{item.descripcion}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC', // Color de fondo relajante para reducir carga cognitiva
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1A202C',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
        marginBottom: 40,
        textAlign: 'center',
    },
    searchContainer: {
        width: '100%',
        position: 'relative', // Importante para que la lista flote por encima si agregamos más cosas abajo
    },
    searchInput: {
        height: 55,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 18,
        color: '#2D3748',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2, // Sombra sutil en Android
    },
    listContainer: {
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        maxHeight: 200,
        overflow: 'hidden',
    },
    routeItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    routeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B6CB0', // Azul corporativo intuitivo
    },
    routeDesc: {
        fontSize: 14,
        color: '#A0AEC0',
        marginTop: 4,
    }
});