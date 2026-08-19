import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

export default function OfflineModal({ visible, onClose }) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose} // Para cuando el usuario presione el botón de "atrás" en Android
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>

                    {/* Icono de advertencia */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="cloud-offline" size={50} color={theme.colors.danger} />
                    </View>

                    {/* Textos de Alto Contraste */}
                    <Text style={styles.title}>Sin conexión a Internet</Text>
                    <Text style={styles.message}>
                        Parece que perdiste la señal. Estás viendo las rutas y paraderos guardados en la memoria caché de tu celular. El tiempo de arribo (ETA) no estará disponible hasta recuperar la conexión.
                    </Text>

                    {/* Botón de Acción */}
                    <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Entendido</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo oscuro semitransparente para centrar la atención
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: theme.colors.surface,
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        ...theme.shadows.heavy, // Sombra definida en tus estilos globales
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF0F0', // Rojo muy clarito
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.textDark,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    button: {
        backgroundColor: theme.colors.primary,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '700',
    },
});
