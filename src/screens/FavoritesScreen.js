import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getFavoriteRouteNames } from '../services/favorites';
import { getRouteByName } from '../services/routes';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';
import RouteListItem from '../components/RouteListItem';
import EmptyState from '../components/EmptyState';

export default function FavoritesScreen({ navigation }) {
    const [favorites, setFavorites] = useState([]);
    const refresh = useCallback(async () => setFavorites((await getFavoriteRouteNames()).map(getRouteByName).filter(Boolean)), []);
    useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Mis Rutas Favoritas" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>
                {favorites.length ? <View style={styles.list}>{favorites.map((item) => <RouteListItem key={item.id} route={item} favorite onPress={() => navigation.navigate('RouteDetails', { routeName: item.nombre })} />)}</View> : <EmptyState icon="heart-outline" title="Aún no tienes rutas favoritas" message="Guarda las rutas que más utilizas para tenerlas siempre a un toque." actionLabel="Explorar rutas" onAction={() => navigation.navigate('MainTabs', { screen: 'ExploreRoutes' })} />}
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.background }, content: { flexGrow: 1, padding: 20 }, list: { gap: 10 } });
