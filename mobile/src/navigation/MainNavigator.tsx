import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';

// Import screens
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import HomeScreen from '@/screens/HomeScreen';
import ShowsScreen from '@/screens/ShowsScreen';
import ShowDetailScreen from '@/screens/ShowDetailScreen';
import ProfileScreen from '@/screens/ProfileScreen';

// Type definitions
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Shows: undefined;
  Profile: undefined;
};

export type ShowsStackParamList = {
  ShowsList: undefined;
  ShowDetail: { showId: number };
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ShowsStack = createStackNavigator<ShowsStackParamList>();

// Shows stack navigator (nested in tab navigator)
const ShowsNavigator = () => {
  return (
    <ShowsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ShowsStack.Screen name="ShowsList" component={ShowsScreen} />
      <ShowsStack.Screen 
        name="ShowDetail" 
        component={ShowDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: 'Show Details',
        })}
      />
    </ShowsStack.Navigator>
  );
};

// Main authenticated tab navigator
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: true,
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <MainTab.Screen
        name="Shows"
        component={ShowsNavigator}
        options={{
          title: 'Shows',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <ShowsIcon color={color} size={size} />,
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
        }}
      />
    </MainTab.Navigator>
  );
};

// Auth stack navigator (for login/register)
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Root navigator that handles auth state
const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </SafeAreaView>
    );
  }
  
  return user ? <MainTabNavigator /> : <AuthNavigator />;
};

// Main navigation container component
const MainNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

// Icon components
const HomeIcon = ({ color, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ShowsIcon = ({ color, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ProfileIcon = ({ color, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainNavigator;