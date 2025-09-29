import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

// --- Colores y Estilos Reutilizados ---
const TERRACOTTA = '#d96c3d';
const DARK_GREY = '#3A3A3A';
const OFF_WHITE = '#FAF9F6';
const BACKGROUND_IMAGE = require('../assets/vine-9039366.jpg');

// --- Componente Principal ---
export default function Home({ navigation, route }) {
  const user = auth.currentUser;
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Animación de desvanecimiento
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (route?.params?.animateFade) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }
  }, [route?.params?.animateFade]);

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      showAlert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  const displayName = user?.email?.split('@')[0] || 'Usuario';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          {/* --- Animación de desvanecimiento --- */}
          <Animated.View
            pointerEvents="none"
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: TERRACOTTA,
              opacity: fadeAnim,
              zIndex: 10,
            }}
          />
          {/* --- Encabezado --- */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>¡Hola, {displayName}!</Text>
              <Text style={styles.headerSubtitle}>Bienvenido a Puerto Real</Text>
            </View>
            <TouchableOpacity onPress={handleLogOut}>
              <FontAwesome name="sign-out" size={30} color={TERRACOTTA} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.panelTitle}>Panel de Control</Text>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ControlCompras')}>
              <FontAwesome name="shopping-cart" size={40} color={TERRACOTTA} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Control de Compras</Text>
              <Text style={styles.cardDescription}>Registra y gestiona tus compras de insumos.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GestionProveedores')}>
              <FontAwesome name="truck" size={40} color={TERRACOTTA} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Gestión de Proveedores</Text>
              <Text style={styles.cardDescription}>Administra la información de tus proveedores.</Text>
            </TouchableOpacity>
          </ScrollView>
          <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

// --- Hoja de Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_GREY,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  headerSubtitle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: '#E0E0E0',
  },
  scrollContainer: {
    padding: 20,
  },
  panelTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: OFF_WHITE,
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardIcon: {
    marginBottom: 15,
  },
  cardTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: DARK_GREY,
    marginBottom: 5,
  },
  cardDescription: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: DARK_GREY,
    textAlign: 'center',
  },
});