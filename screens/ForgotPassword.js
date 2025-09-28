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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import CustomAlert from '../components/CustomAlert';
import Input from '../components/Input';

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

// --- Componente Principal ---
export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showAlert("Error", "Por favor ingrese su correo electrónico.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showAlert("Correo Enviado", "Se ha enviado un correo para restablecer su contraseña. Revisa tu bandeja de entrada y spam.");
      navigation.navigate('Login');
    } catch (error) {
      let errorMessage = "Hubo un problema al enviar el correo.";
      if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
        errorMessage = "No se encontró un usuario con este correo.";
      }
      showAlert("Error", errorMessage);
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
                <Text style={styles.welcomeText}>Recuperar Contraseña</Text>
                <Text style={styles.infoText}>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</Text>

                <Input
                  icon="envelope"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetButtonText}>Restablecer Contraseña</Text>}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Volver</Text>
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
    backgroundColor: '#FAF9F6', // Blanco roto cálido
    padding: 25,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  welcomeText: {
    fontSize: 30, // Ajuste de tamaño para la nueva fuente
    color: DARK_GREY,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold', // Fuente Sans-Serif fuerte
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
    marginTop: 20, // Espacio para separar del recuadro
    paddingVertical: 15,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
});
