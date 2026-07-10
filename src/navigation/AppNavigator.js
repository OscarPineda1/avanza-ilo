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
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="MapScreen" component={MapScreen} />
            </Stack.Navigator>
            <OfflineModal
                visible={isOffline && !offlineModalDismissed}
                onClose={() => setOfflineModalDismissed(true)}
            />
        </NavigationContainer>
    );
}
