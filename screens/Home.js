import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

// --- Colores y Estilos Reutilizados ---
const MAROON = '#922b21';
const YELLOW = '#F3F38B';
const LOGO_STYLE = {
  tintColor: '#F3F38B',
};
const BACKGROUND_IMAGE = require('../assets/splash.png');

// --- Componente Principal ---
export default function Home({ navigation }) {
  const user = auth.currentUser;

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.userInfoContainer}>
            <FontAwesome name="user-circle" size={24} color="white" />
            <Text style={styles.userName}>{user?.displayName || user?.email}</Text>
        </View>

        <View style={styles.mainContent}>
            <View style={styles.maroonBox}>
                <TouchableOpacity style={styles.comprasButton} onPress={() => navigation.navigate('ControlCompras')}>
                    <Text style={styles.comprasButtonText}>Control de Compras</Text>
                </TouchableOpacity>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
            </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

// --- Hoja de Estilos ---
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  userName: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  mainContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
  },
  maroonBox: {
    width: '85%',
    backgroundColor: 'rgba(146, 43, 33, 0.85)', // Maroon with transparency
    borderRadius: 30, // semi-oval
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  comprasButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25, // semi-oval
    paddingVertical: 15,
    width: '90%',
    alignItems: 'center',
    marginBottom: 20, // Space between button and logo
  },
  comprasButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 80,
    height: 80,
    ...LOGO_STYLE,
  },
  logoutButton: {
    backgroundColor: YELLOW,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25, // semi-oval
    marginVertical: 30,
  },
  logoutButtonText: {
    color: MAROON,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
