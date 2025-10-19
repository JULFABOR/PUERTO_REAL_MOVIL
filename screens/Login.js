/**
 * @file Login.js
 * @description Pantalla de inicio de sesión de usuario.
 */

import React, { useState, useRef } from 'react';
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
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import Input from '../components/Input';
import { validarEmail } from '../components/validaciones';
import { useTranslation } from 'react-i18next';

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

/**
 * Componente principal de la pantalla de Login.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.navigation - Objeto de navegación de React Navigation.
 * @returns {JSX.Element}
 */
export default function Login({ navigation }) {
  const { t } = useTranslation();
  // Estados del componente
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [buttonTextVisible, setButtonTextVisible] = useState(true);

  // Referencia para la animación del círculo de transición
  const circleAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');
  const maxDiameter = Math.sqrt(width * width + height * height) * 2;

  /**
   * Muestra una alerta personalizada.
   * @param {string} title - Título de la alerta.
   * @param {string} message - Mensaje de la alerta.
   */
  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  /**
   * Maneja el proceso de inicio de sesión.
   * Valida las credenciales y utiliza Firebase Auth para autenticar al usuario.
   * Inicia una animación de transición si el login es exitoso.
   */
  const handleLogin = async () => {
    if (!email || !password) {
      showAlert(t("error"), t("completeBothFields"));
      return;
    }
    if (!validarEmail(email)) {
      showAlert(t("error"), t("invalidEmailFormat"));
      return;
    }
    setLoading(true);
    setButtonTextVisible(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Inicia la animación de círculo
      Animated.timing(circleAnim, {
        toValue: maxDiameter,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => {
        // Navega a la pantalla principal y resetea el estado de la animación
        navigation.reset({ index: 0, routes: [{ name: 'App' }] });
        circleAnim.setValue(0);
        setButtonTextVisible(true);
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
      setButtonTextVisible(true);
      let errorMessage = t("loginProblem");
      // Manejo de errores específicos de Firebase
      if (
        error.code === 'auth/invalid-email' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found'
      ) {
        errorMessage = t("invalidCredentials");
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = t("connectionError");
      }
      showAlert(t("loginError"), errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          {/* Círculo animado para la transición */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: circleAnim,
              height: circleAnim,
              borderRadius: maxDiameter / 2,
              backgroundColor: TERRACOTTA,
              transform: [
                { translateX: Animated.multiply(circleAnim, -0.5) },
                { translateY: Animated.multiply(circleAnim, -0.5) },
              ],
              opacity: circleAnim.interpolate({
                inputRange: [0, maxDiameter * 0.7, maxDiameter],
                outputRange: [0.7, 0.9, 1],
              }),
              zIndex: 100,
            }}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Image source={require('../assets/logo.png')} style={styles.logo} />

              <BlurView intensity={100} tint="light" style={styles.contentBox}>
                {/* Selector para cambiar entre Login y Registro */}
                <View style={styles.tabSwitch}>
                  <View style={styles.tabSlider} />
                  <Text style={styles.tabTextActive}>{t('ingresar')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.tabItem}>
                    <Text style={styles.tabTextInactive}>{t('register')}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.welcomeText}>
                  {t('welcomeTo')} <Text style={{ color: TERRACOTTA }}>Puerto Real!</Text>
                </Text>

                {/* Campos de entrada para email y contraseña */}
                <Input
                  icon="envelope"
                  placeholder={t('email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.passwordContainer}>
                  <Input
                    placeholder={t('password')}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
                    <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={20} color={DARK_GREY} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
                </TouchableOpacity>

                {/* Botón de Login */}
                <View style={{ position: 'relative', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading || !buttonTextVisible}>
                    {loading ? <ActivityIndicator color="#fff" /> : buttonTextVisible && <Text style={styles.loginButtonText}>{t('ingresar')}</Text>}
                  </TouchableOpacity>
                </View>

              </BlurView>

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
    backgroundColor: 'rgba(250, 249, 246, 0.15)',
    padding: 25,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
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
    fontSize: 30,
    color: DARK_GREY,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
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
    opacity: 0.6,
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
