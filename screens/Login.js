import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import Input from '../components/Input';

// --- Colores y Estilos Reutilizados ---
const TERRACOTTA = '#d96c3d';
const DARK_GREY = '#3A3A3A';
const LOGO_STYLE = {
  width: 210,
  height: 210,
  transform: [{ rotate: '-11deg' }],
  tintColor: '#F3F38B',
};
const BACKGROUND_IMAGE = require('../assets/vine-9039366.jpg');

// --- Componente Principal ---
export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Error", "Por favor ingrese ambos campos.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      let errorMessage = "Hubo un problema al iniciar sesión.";
      if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        errorMessage = "La contraseña o el correo son incorrectos.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Error de conexión, por favor intenta más tarde.";
      }
      showAlert("Error de inicio de sesión", errorMessage);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
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
                  ¡Bienvenido a <Text style={{ color: TERRACOTTA }}>Puerto Real!</Text>
                </Text>

                <Input
                  icon="envelope"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.passwordContainer}>
                  <Input
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
                    <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={20} color={DARK_GREY} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Ingresar</Text>}
                </TouchableOpacity>

              </View>

            </ScrollView>
          </KeyboardAvoidingView>
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
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    ...LOGO_STYLE,
    alignSelf: 'center',
    marginBottom: 20,
  },
  contentBox: {
    width: '90%',
    backgroundColor: '#FAF9F6', // Blanco roto cálido
    padding: 25,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
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
    backgroundColor: TERRACOTTA,
    borderRadius: 50,
    left: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabTextActive: {
    color: '#fff',
    fontSize: 16,
    zIndex: 1,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  tabTextInactive: {
    color: DARK_GREY,
    fontSize: 16,
    zIndex: 1,
    fontFamily: 'Roboto-Regular',
  },
  welcomeText: {
    fontSize: 30, // Ajuste de tamaño para la nueva fuente
    color: DARK_GREY,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold', // Fuente Sans-Serif fuerte
  },
  passwordContainer: {
    width: '100%',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 5,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 10,
    opacity: 0.6, // Opacidad para consistencia
  },
  forgotPasswordText: {
    color: DARK_GREY,
    fontSize: 14,
    marginTop: 15,
    marginBottom: 25,
    alignSelf: 'flex-start',
    fontFamily: 'Roboto-Regular',
  },
  loginButton: {
    width: '100%',
    backgroundColor: TERRACOTTA,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
});