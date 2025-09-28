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
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
export default function SignUp({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return 'red';
    if (strength <= 4) return 'orange';
    return 'green';
  };

  const handleSignUp = async () => {
    if (!nombre || !apellido || !dni || !email || !password || !confirmPassword) {
      showAlert("Error", "Todos los campos son obligatorios.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (getPasswordStrength() < 5) {
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
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil (mínimo 6 caracteres).";
          break;
        default:
          errorMessage = error.message;
          break;
      }
      showAlert("Error de Registro", errorMessage);
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
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.tabItem}>
                   <Text style={styles.tabTextInactive}>Ingresar</Text>
                </TouchableOpacity>
                <Text style={styles.tabTextActive}>Registrarse</Text>
              </View>

              <Text style={styles.welcomeText}>Crea tu cuenta</Text>

              <Input
                icon="user"
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                accessibilityLabel="Nombre"
                accessibilityHint="Ingrese su nombre"
              />
              <Input
                icon="user"
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
                accessibilityLabel="Apellido"
                accessibilityHint="Ingrese su apellido"
              />
              <Input
                icon="id-card"
                placeholder="DNI"
                value={dni}
                onChangeText={setDni}
                keyboardType="numeric"
                accessibilityLabel="DNI"
                accessibilityHint="Ingrese su DNI"
              />
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
              
              <View style={styles.passwordStrengthContainer}>
                <View style={[styles.strengthBar, { width: `${getPasswordStrength() * 20}%`, backgroundColor: getStrengthColor() }]} />
              </View>
              <View style={styles.passwordRequirementsContainer}>
                <Text style={styles.passwordRequirementsTitle}>La contraseña debe contener:</Text>
                <Text style={styles.passwordRequirement}>- Al menos 8 caracteres</Text>
                <Text style={styles.passwordRequirement}>- Una letra mayúscula (e.g., A, B, C)</Text>
                <Text style={styles.passwordRequirement}>- Una letra minúscula (e.g., a, b, c)</Text>
                <Text style={styles.passwordRequirement}>- Un número (e.g., 1, 2, 3)</Text>
                <Text style={styles.passwordRequirement}>- Un caracter especial (e.g., !, @, #)</Text>
              </View>

              <View style={styles.passwordContainer}>
                <Input
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  accessibilityLabel="Confirmar Contraseña"
                  accessibilityHint="Vuelva a ingresar su contraseña"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showPasswordButton}>
                  <FontAwesome name={showConfirmPassword ? 'eye-slash' : 'eye'} size={20} color={DARK_GREY} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.registerButton} onPress={handleSignUp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Registrarse</Text>}
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
  safeArea: { flex: 1, backgroundColor: MUSTARD },
  backgroundImage: { flex: 1 },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, height: '100%' },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  logo: { ...LOGO_STYLE, alignSelf: 'center', marginTop: 20 },
  contentBox: { width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, padding: 25, alignItems: 'center', marginTop: 20 },
  tabSwitch: { flexDirection: 'row', backgroundColor: DARK_GREY, borderRadius: 50, padding: 5, marginBottom: 25, width: '100%', position: 'relative', justifyContent: 'space-around', alignItems: 'center' },
  tabSlider: { position: 'absolute', width: '50%', height: '100%', backgroundColor: TERRACOTTA, borderRadius: 50, right: 5 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 16, zIndex: 1, flex: 1, textAlign: 'center', fontFamily: 'Lato-Bold' },
  tabTextInactive: { color: '#fff', fontWeight: 'normal', fontSize: 16, zIndex: 1, fontFamily: 'Lato-Regular' },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: DARK_GREY, marginBottom: 20, textAlign: 'center', fontFamily: 'Lato-Bold' },
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
  passwordStrengthContainer: {
    width: '100%',
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginTop: 10,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 5,
  },
  passwordRequirementsContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
  },
  passwordRequirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DARK_GREY,
    marginBottom: 5,
    fontFamily: 'Lato-Bold',
  },
  passwordRequirement: {
    fontSize: 12,
    color: DARK_GREY,
    fontFamily: 'Lato-Regular',
  },
  registerButton: { width: '100%', backgroundColor: TERRACOTTA, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Lato-Bold' },
});
