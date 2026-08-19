import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { useNetwork } from '../context/NetworkContext';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ExploreRoutesScreen from '../screens/ExploreRoutesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MapOverviewScreen from '../screens/MapOverviewScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AboutScreen from '../screens/AboutScreen';
import StopSelectionScreen from '../screens/StopSelectionScreen';
import LocationPermissionScreen from '../screens/LocationPermissionScreen';
import NearbyStopsScreen from '../screens/NearbyStopsScreen';
import EtaLoadingScreen from '../screens/EtaLoadingScreen';
import LiveRouteScreen from '../screens/LiveRouteScreen';
import StatusScreen from '../screens/StatusScreen';
import BottomNavbar from '../components/BottomNavbar';
import OfflineModal from '../components/OfflineModal';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <BottomNavbar {...props} />}
            tabBarPosition="bottom"
            screenOptions={{ swipeEnabled: true }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapOverviewScreen} />
            <Tab.Screen name="ExploreRoutes" component={ExploreRoutesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { isOffline } = useNetwork();
    const [offlineModalDismissed, setOfflineModalDismissed] = useState(false);

    useEffect(() => {
        if (!isOffline) {
            setOfflineModalDismissed(false);
        }
    }, [isOffline]);

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="RouteDetails" component={MapScreen} />
                <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
                <Stack.Screen name="Favorites" component={FavoritesScreen} />
                <Stack.Screen name="About" component={AboutScreen} />
                <Stack.Screen name="StopSelection" component={StopSelectionScreen} />
                <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
                <Stack.Screen name="NearbyStops" component={NearbyStopsScreen} />
                <Stack.Screen name="EtaLoading" component={EtaLoadingScreen} />
                <Stack.Screen name="LiveRoute" component={LiveRouteScreen} />
                <Stack.Screen name="Status" component={StatusScreen} />
            </Stack.Navigator>
            <OfflineModal
                visible={isOffline && !offlineModalDismissed}
                onClose={() => setOfflineModalDismissed(true)}
            />
        </NavigationContainer>
    );
}
