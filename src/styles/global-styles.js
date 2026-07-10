import { StyleSheet, Platform } from 'react-native';

// 1. PALETA DE COLORES CORPORATIVA Y ALTO CONTRASTE
export const theme = {
    colors: {
        background: '#F8F9FA',
        surface: '#FFFFFF',
        primary: '#1267FF',
        textDark: '#1A1A1A',
        textMuted: '#666666',
        textLight: '#A0A0A0',
        border: '#E5E5E5',

        // Alertas y Resiliencia
        danger: '#E74C3C',
        warningBg: '#FFF5EC',
        warningText: '#D35400',
        warningBorder: '#FFE0C2',

        // Colores de Rutas
        ruta1A: '#1267FF',
        rutaD: '#FF3644',
        ruta12: '#2ECC71',
        ruta14: '#2ECC71',
        ruta10: '#9B59B6',
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
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

    // Header
    header: { padding: 20, paddingTop: 40 },
    title: { fontSize: 24, fontWeight: '800', color: theme.colors.textDark },
    headerTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.textDark },
    subtitle: { fontSize: 16, color: theme.colors.textMuted, marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textDark, marginTop: 24, marginBottom: 12 },

    // Filtros
    filterPill: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#EEE', marginRight: 10, borderWidth: 1, borderColor: '#DDD'
    },
    filterPillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    filterText: { color: theme.colors.textMuted, fontWeight: '600' },
    filterTextActive: { color: '#FFF' },

});