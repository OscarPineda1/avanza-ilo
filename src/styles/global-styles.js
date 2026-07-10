import { StyleSheet } from 'react-native';

import { theme } from './theme';

export { theme };

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
