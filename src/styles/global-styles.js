import { StyleSheet, Platform } from 'react-native';

// 1. PALETA DE COLORES CORPORATIVA Y ALTO CONTRASTE
export const theme = {
    colors: {
        background: '#F8F9FA', // Fondo principal relajante
        surface: '#FFFFFF',    // Tarjetas y modales
        primary: '#1267FF',    // Azul Avanza Ilo (Acciones principales)
        textDark: '#1A1A1A',   // Texto principal (Alta legibilidad)
        textMuted: '#666666',  // Subtítulos
        textLight: '#A0A0A0',  // Textos deshabilitados o placeholders
        border: '#E5E5E5',     // Divisores

        // Alertas y Resiliencia
        danger: '#E74C3C',     // Modo offline / Errores
        warningBg: '#FFF5EC',  // Fondo de banner informativo
        warningText: '#D35400',// Texto de banner informativo
        warningBorder: '#FFE0C2',

        // Colores de Rutas (Directorio)
        ruta1A: '#1267FF',
        rutaD: '#FF3644',
        ruta14: '#2ECC71',
    },
    shadows: {
        base: {
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        heavy: {
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
        }
    }
};

// 2. CLASES GLOBALES REUTILIZABLES
export const globalStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.textDark,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        marginTop: 4,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textDark,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 10,
    }
});