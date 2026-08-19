import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

// Ahora React Navigation le pasa 'state' y 'navigation' automáticamente
export default function BottomNavbar({ state, navigation }) {
    return (
        <View style={styles.bottomNavbar}>
            {state.routes.map((route, index) => {
                // Detecta si esta pestaña es la que está activa (incluso si llegaste deslizando)
                const isFocused = state.index === index;

                let iconName = '';
                let label = '';

                // Configuramos los íconos y textos según la ruta
                if (route.name === 'Home') {
                    iconName = isFocused ? 'home' : 'home-outline';
                    label = 'Inicio';
                } else if (route.name === 'ExploreRoutes') {
                    iconName = isFocused ? 'bus' : 'bus-outline';
                    label = 'Explorar';
                } else if (route.name === 'Map') {
                    iconName = isFocused ? 'map' : 'map-outline';
                    label = 'Mapa';
                } else if (route.name === 'Profile') {
                    iconName = isFocused ? 'person' : 'person-outline';
                    label = 'Perfil';
                }

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.navItem}
                        onPress={() => {
                            // Navegar al tocar el botón
                            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        }}
                    >
                        <Ionicons name={iconName} size={24} color={isFocused ? theme.colors.primary : '#8E8E93'} />
                        <Text style={[styles.navText, isFocused && styles.navTextActive]}>{label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNavbar: {
        height: Platform.OS === 'ios' ? 85 : 70,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        ...theme.shadows.base,
    },
    navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    navText: { fontSize: 12, marginTop: 4, color: '#8E8E93', fontWeight: '500' },
    navTextActive: { color: theme.colors.primary, fontWeight: '700' },
});
