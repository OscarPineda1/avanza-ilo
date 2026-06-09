import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/global-styles';

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
        <SafeAreaView style={globalStyles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={globalStyles.content}
            >
                <Text style={globalStyles.title}>Avanza Ilo</Text>
                <Text style={globalStyles.subtitle}>Encuentra tu ruta en un solo toque</Text>

                <View style={globalStyles.searchContainer}>
                    <TextInput
                        style={globalStyles.searchInput}
                        placeholder="Busca tu ruta (ej. 1A, D, 14)..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                    />

                    {/* Renderizado Condicional: Solo aparece si hay coincidencias */}
                    {filteredRoutes.length > 0 && (
                        <View style={globalStyles.listContainer}>
                            <FlatList
                                data={filteredRoutes}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={globalStyles.routeItem}
                                        onPress={() => handleSelectRoute(item)}
                                    >
                                        <Text style={globalStyles.routeName}>{item.nombre}</Text>
                                        <Text style={globalStyles.routeDesc}>{item.descripcion}</Text>
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