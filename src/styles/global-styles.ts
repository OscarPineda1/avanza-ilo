import { Dimensions, StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
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
        position: 'relative',
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
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    infoCard: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    cardContent: {
        padding: 25,
        alignItems: 'center',
    },
    routeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    backButton: {
        backgroundColor: '#E2E8F0',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#2D3748',
        fontSize: 16,
        fontWeight: '600',
    }
});