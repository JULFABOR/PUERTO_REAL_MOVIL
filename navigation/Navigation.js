import React, { useState, useEffect, useContext } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { auth } from '../src/config/firebaseConfig';
import { ThemeContext } from '../theme/ThemeContext';

import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import ForgotPassword from '../screens/ForgotPassword';
import ControlCompras from '../screens/ControlCompras';
import GestionProveedores from '../screens/GestionProveedores';
import GestionStock from '../screens/GestionStock';
import TabNavigator from './TabNavigator'; // Importamos el nuevo Tab Navigator
import PreferencesScreen from '../screens/PreferencesScreen';
import HelpScreen from '../screens/HelpScreen';

const Stack = createStackNavigator();
const AppStack = createStackNavigator();

function AppNavigator() {
  return (
    <AppStack.Navigator 
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
      }}
    >
      <AppStack.Screen name="Main" component={TabNavigator} />
      <AppStack.Screen name="ControlCompras" component={ControlCompras} />
      <AppStack.Screen name="GestionProveedores" component={GestionProveedores} />
      <AppStack.Screen name="GestionStock" component={GestionStock} />
      <AppStack.Screen name="Preferences" component={PreferencesScreen} />
      <AppStack.Screen name="Help" component={HelpScreen} />
    </AppStack.Navigator>
  );
}

function Navigation() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const { theme, isDarkMode } = useContext(ThemeContext);

  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...theme,
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
    },
  };

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; 
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.card} />
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      >
        {user ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
