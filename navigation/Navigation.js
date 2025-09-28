import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { auth } from '../src/config/firebaseConfig';
import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import ControlCompras from '../screens/ControlCompras';
import ForgotPassword from '../screens/ForgotPassword';
import GestionProveedores from '../screens/GestionProveedores';

const Stack = createStackNavigator();

function Navigation() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

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
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={user ? 'Home' : 'Welcome'}
        screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      >
        <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ControlCompras" component={ControlCompras} />
        <Stack.Screen name="GestionProveedores" component={GestionProveedores} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
