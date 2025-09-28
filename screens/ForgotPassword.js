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
import { LinearGradient } from 'expo-linear-gradient';
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
      showAlert("Correo Enviado", "Se ha enviado un correo para restablecer su contraseña.");
      navigation.navigate('Login');
    } catch (error) {
      let errorMessage = "Hubo un problema al enviar el correo.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        default:
          errorMessage = error.message;
          break;
      }
      showAlert("Error", errorMessage);
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
              <Text style={styles.welcomeText}>Recuperar Contraseña</Text>

              <Input
                icon="envelope"
                placeholder="Correo Electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Correo Electrónico"
                accessibilityHint="Ingrese su correo electrónico para recuperar su contraseña"
              />

              <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetButtonText}>Enviar Correo</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.backContainer} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backText}>
                Volver a <Text style={{ color: YELLOW, fontWeight: 'bold' }}>Ingresar</Text>
              </Text>
            </TouchableOpacity>
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
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK_GREY,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Lato-Bold',
  },
  resetButton: {
    width: '100%',
    backgroundColor: TERRACOTTA,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Lato-Bold',
  },
  backContainer: {
    paddingVertical: 15,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Lato-Regular',
  },
});