/**
 * @file ForgotPassword.js
 * @description Pantalla para que los usuarios puedan restablecer su contraseña.
 * @author [Tu Nombre]
 */

import React, { useState, useCallback } from 'react';
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
import { BlurView } from 'expo-blur';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import CustomAlert from '../components/CustomAlert';
import Input from '../components/Input';
import { validarEmail } from '../components/validaciones';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

// --- Colores y Estilos Reutilizados ---
const TERRACOTTA = '#d96c3d';
const DARK_GREY = '#3A3A3A';
const YELLOW = '#F3F38B';
const LOGO_STYLE = {
  width: 210,
  height: 210,
  transform: [{ rotate: '-11deg' }],
  tintColor: '#F3F38B',
};
const BACKGROUND_IMAGE = require('../assets/vine-9039366.jpg');

/**
 * Componente principal de la pantalla de recuperación de contraseña.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.navigation - Objeto de navegación de React Navigation.
 * @returns {JSX.Element}
 */
export default function ForgotPassword({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  /**
   * Hook de efecto que se ejecuta cuando la pantalla obtiene el foco.
   * Restablece los estados del formulario para una nueva interacción.
   */
  useFocusEffect(
    useCallback(() => {
      setAlertVisible(false);
      setEmail('');
      setLoading(false);

      return () => {
        // Limpieza opcional al salir de la pantalla
      };
    }, [])
  );

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
   * Maneja el proceso de restablecimiento de contraseña.
   * Valida el email y utiliza Firebase Auth para enviar el correo de recuperación.
   */
  const handlePasswordReset = async () => {
    if (!email) {
      showAlert(t('error'), t('pleaseEnterEmail'));
      return;
    }
    if (!validarEmail(email)) {
      showAlert(t('error'), t('invalidEmailFormat'));
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showAlert(t('emailSent'), t('passwordResetEmailSent'));
      // Pausa para que el usuario vea la alerta antes de navegar a Login
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (error) {
      let errorMessage = t('problemSendingEmail');
      if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
        errorMessage = t('userNotFound');
      }
      showAlert(t('error'), errorMessage);
      setLoading(false);
    }
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

              <BlurView intensity={100} tint="light" style={styles.contentBox}>
                <Text style={styles.welcomeText}>{t('recoverPassword')}</Text>
                <Text style={styles.infoText}>{t('recoverPasswordInfo')}</Text>

                <Input
                  icon="envelope"
                  placeholder={t('email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetButtonText}>{t('resetPassword')}</Text>}
                </TouchableOpacity>
              </BlurView>

              <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>{t('goBack')}</Text>
              </TouchableOpacity>
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
  welcomeText: {
    fontSize: 30,
    color: DARK_GREY,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  infoText: {
    fontSize: 15,
    color: DARK_GREY,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },
  resetButton: {
    width: '100%',
    backgroundColor: TERRACOTTA,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  backContainer: {
    marginTop: 20,
    paddingVertical: 15,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
});
