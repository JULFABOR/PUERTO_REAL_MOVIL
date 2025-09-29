import React, { useState, useEffect } from 'react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
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

// --- Componente de Requisito de Contraseña ---
const PasswordRequirement = ({ met, text }) => (
  <Text style={[styles.passwordRequirement, met && styles.passwordRequirementMet]}>
    {met ? '○' : '-'} {text}
  </Text>
);

// --- Componente Principal ---
export default function SignUp({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [isLengthValid, setLengthValid] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const strengthBarWidth = Math.min(100, (password.length / 8) * 100) + '%';

  const toggleShowPasswords = () => {
    setShowPasswords(!showPasswords);
  };

  useEffect(() => {
    setLengthValid(password.length >= 8);
    setHasUppercase(/[A-Z]/.test(password));
    setHasLowercase(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[^a-zA-Z0-9]/.test(password));
  }, [password]);

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || confirmPassword.length === 0);
  }, [password, confirmPassword]);

  const allRequirementsMet = isLengthValid && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSignUp = async () => {
    if (!nombre || !apellido || !email || !password || !confirmPassword) {
      showAlert("Error", "Todos los campos son obligatorios.");
      return;
    }
    if (!passwordsMatch) {
      showAlert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (!allRequirementsMet) {
      showAlert("Error", "La contraseña no cumple con los requisitos de seguridad.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showAlert("Registro exitoso", "Tu cuenta ha sido creada. Por favor, inicia sesión.");
      navigation.navigate('Login');
    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico ya está en uso.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del correo electrónico no es válido.";
      }
      showAlert("Error de Registro", errorMessage);
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

              <BlurView intensity={100} tint="light" style={styles.contentBox}>
                <View style={styles.tabSwitch}>
                  <View style={[styles.tabSlider, { right: 5 }]} />
                  <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.tabItem}>
                    <Text style={styles.tabTextInactive}>Ingresar</Text>
                  </TouchableOpacity>
                  <Text style={styles.tabTextActive}>Registrarse</Text>
                </View>

                <Text style={styles.welcomeText}>Crea tu cuenta</Text>

                <Input icon="user" placeholder="Nombre" value={nombre} onChangeText={setNombre} />
                <Input icon="user" placeholder="Apellido" value={apellido} onChangeText={setApellido} />
                <Input icon="envelope" placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                
                <View style={styles.passwordContainer}>
                  <Input placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry={!showPasswords} />
                  <TouchableOpacity onPress={toggleShowPasswords} style={styles.showPasswordButton}>
                    <FontAwesome name={showPasswords ? 'eye-slash' : 'eye'} size={20} color={DARK_GREY} />
                  </TouchableOpacity>
                </View>

                <View style={styles.strengthBarContainer}>
                  <View style={[styles.strengthBar, { width: strengthBarWidth }]} />
                </View>
                
                <View style={styles.passwordRequirementsContainer}>
                  <Text style={styles.passwordRequirementsTitle}>La contraseña debe contener:</Text>
                  <PasswordRequirement met={isLengthValid} text="Al menos 8 caracteres" />
                  <PasswordRequirement met={hasUppercase} text="Una letra mayúscula (A-Z)" />
                  <PasswordRequirement met={hasLowercase} text="Una letra minúscula (a-z)" />
                  <PasswordRequirement met={hasNumber} text="Un número (0-9)" />
                  <PasswordRequirement met={hasSpecialChar} text="Un caracter especial (!, @, #)" />
                </View>

                <View style={styles.passwordContainer}>
                  <Input placeholder="Confirmar Contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPasswords} />
                  <TouchableOpacity onPress={toggleShowPasswords} style={styles.showPasswordButton}>
                    <FontAwesome name={showPasswords ? 'eye-slash' : 'eye'} size={20} color={DARK_GREY} />
                  </TouchableOpacity>
                </View>
                {!passwordsMatch && <Text style={styles.passwordMismatchError}>Las contraseñas no coinciden.</Text>}

                <TouchableOpacity style={styles.registerButton} onPress={handleSignUp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Registrarse</Text>}
                </TouchableOpacity>

              </BlurView>

            </ScrollView>
          </KeyboardAvoidingView>
          <CustomAlert visible={alertVisible} title={alertTitle} message={alertMessage} onClose={() => setAlertVisible(false)} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

// --- Hoja de Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK_GREY },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  logo: { ...LOGO_STYLE, alignSelf: 'center', marginBottom: 20 },
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
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabTextActive: { color: '#fff', fontSize: 16, zIndex: 1, flex: 1, textAlign: 'center', fontFamily: 'Roboto-Bold' },
  tabTextInactive: { color: DARK_GREY, fontSize: 16, zIndex: 1, fontFamily: 'Roboto-Regular' },
  welcomeText: { fontSize: 30, color: DARK_GREY, marginBottom: 25, textAlign: 'center', fontFamily: 'Roboto-Bold' },
  passwordContainer: { width: '100%' },
  showPasswordButton: {
    position: 'absolute',
    right: 5,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 10,
    opacity: 0.6,
  },
  strengthBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: -10,
    marginBottom: 15,
  },
  strengthBar: {
    height: '100%',
    backgroundColor: TERRACOTTA,
    borderRadius: 3,
  },
  passwordRequirementsContainer: {
    width: '100%',
    paddingHorizontal: 5,
    opacity: 0.7,
  },
  passwordRequirementsTitle: {
    fontSize: 14,
    color: DARK_GREY,
    marginBottom: 5,
    fontFamily: 'Roboto-Bold',
  },
  passwordRequirement: {
    fontSize: 13,
    color: DARK_GREY,
    fontFamily: 'Roboto-Regular',
  },
  passwordRequirementMet: {
    color: '#2E7D32',
    fontFamily: 'Roboto-Bold',
  },
  passwordMismatchError: {
    color: '#C62828',
    width: '100%',
    textAlign: 'left',
    marginTop: -15,
    marginBottom: 10,
    fontFamily: 'Roboto-Regular',
  },
  registerButton: { width: '100%', backgroundColor: TERRACOTTA, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#fff', fontSize: 18, fontFamily: 'Roboto-Bold' },
});
