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
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import Input from '../components/Input';

// --- Colores y Estilos Reutilizados ---
const MUSTARD = '#E8A83C';
const TERRACOTTA = '#d96c3d';
const DARK_GREY = '#3A3A3A';
const YELLOW = '#F3F38B';
const LOGO_STYLE = {
  width: 210,
  height: 210,
  transform: [{ rotate: '-11deg' }],
  tintColor: '#F3F38B',
};
const BACKGROUND_IMAGE = require('../assets/splash1.jpg');

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
      showAlert("Login exitoso", "Has iniciado sesión correctamente.");
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
      showAlert("Error de inicio de sesión", errorMessage);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <LinearGradient
          colors={['transparent', MUSTARD]}
          style={styles.gradient}
          locations={[0.66, 0.68]}
        />
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
                accessibilityLabel="Correo Electrónico"
                accessibilityHint="Ingrese su correo electrónico"
              />
              <View style={styles.passwordContainer}>
                <Input
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Contraseña"
                  accessibilityHint="Ingrese su contraseña"
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
      </ImageBackground>
    </SafeAreaView>
  );
}

// --- Hoja de Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MUSTARD,
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
    fontWeight: 'bold',
    fontSize: 16,
    zIndex: 1,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Lato-Bold',
  },
  tabTextInactive: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: 16,
    zIndex: 1,
    fontFamily: 'Lato-Regular',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK_GREY,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Lato-Bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 15,
    height: 50,
    justifyContent: 'center',
  },
  forgotPasswordText: {
    color: DARK_GREY,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
    fontFamily: 'Lato-Regular',
  },
  loginButton: {
    width: '100%',
    backgroundColor: TERRACOTTA,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Lato-Bold',
  },
});