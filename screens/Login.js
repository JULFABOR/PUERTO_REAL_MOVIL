import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

// --- Colores y Estilos Reutilizados ---
const MAROON = '#922b21';
const DARK_GREY = '#3A3A3A';
const YELLOW = '#F3F38B';
const LOGO_STYLE = {
  width: 210,
  height: 210,
  transform: [{ rotate: '-11deg' }],
  tintColor: '#F3F38B',
};
const BACKGROUND_IMAGE = require('../assets/splash.png');

// --- Componente Principal ---
export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingrese ambos campos.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login exitoso", "Has iniciado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "La contraseña o el correo son incorrectos.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        default:
          errorMessage = error.message;
          break;
      }
      Alert.alert("Error de inicio de sesión", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <LinearGradient
          colors={['transparent', MAROON]}
          style={styles.gradient}
          locations={[0.66, 0.68]}
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />

          <View style={styles.contentBox}>
            <View style={styles.tabSwitch}>
              <View style={styles.tabSlider} />
              <Text style={styles.tabTextActive}>Ingresar</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.tabItem}>
                <Text style={styles.tabTextInactive}>Registrarse</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.welcomeText}>
              ¡Bienvenido a <Text style={{ color: MAROON }}>Puerto Real!</Text>
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Correo Electrónico"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Ingresar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signupContainer} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}>
              ¿No tienes cuenta? <Text style={{ color: YELLOW, fontWeight: 'bold' }}>Registrate</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

// --- Hoja de Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MAROON,
  },
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    ...LOGO_STYLE,
    alignSelf: 'center',
    marginTop: 20,
  },
  contentBox: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: DARK_GREY,
    borderRadius: 50,
    padding: 5,
    marginBottom: 25,
    width: '100%',
    position: 'relative',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabSlider: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: MAROON,
    borderRadius: 50,
    left: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    zIndex: 1,
    flex: 1,
    textAlign: 'center',
  },
  tabTextInactive: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: 16,
    zIndex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK_GREY,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  forgotPasswordText: {
    color: DARK_GREY,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    backgroundColor: MAROON,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    paddingVertical: 15,
  },
  signupText: {
    color: '#fff',
    fontSize: 16,
  },
});
