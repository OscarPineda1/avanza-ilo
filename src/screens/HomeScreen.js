import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Avanza Ilo</Text>
                <Text style={styles.subtitle}>Selecciona tu ruta para calcular el tiempo de llegada</Text>

                {/* Aquí luego colocaremos el buscador de rutas 1A, D y 14 */}
                <View style={styles.searchPlaceholder}>
                    <Text style={styles.searchText}>Buscador de Rutas...</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Color de fondo limpio
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    searchPlaceholder: {
        width: '100%',
        padding: 15,
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        alignItems: 'center',
    },
    searchText: {
        color: '#888',
        fontSize: 16,
    }
});