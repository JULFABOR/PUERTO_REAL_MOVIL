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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

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
export default function SignUp({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !dni || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (!agreedToTerms) {
      Alert.alert("Error", "Debes aceptar los términos y condiciones para registrarte.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Registro exitoso", "Tu cuenta ha sido creada. Por favor, inicia sesión.");
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
      Alert.alert("Error de Registro", errorMessage);
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
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.tabItem}>
                 <Text style={styles.tabTextInactive}>Ingresar</Text>
              </TouchableOpacity>
              <Text style={styles.tabTextActive}>Registrarse</Text>
            </View>

            <Text style={styles.welcomeText}>Crea tu cuenta</Text>

            <TextInput style={styles.input} placeholder="Apellido y Nombre" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="DNI" value={dni} onChangeText={setDni} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirmar Contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

            <Text style={styles.termsLegend}>Para crear tu cuenta es necesario que aceptes los Términos y condiciones generales de Puerto Real.</Text>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreedToTerms(!agreedToTerms)}>
              <FontAwesome name={agreedToTerms ? 'check-square-o' : 'square-o'} size={24} color={DARK_GREY} />
              <Text style={styles.checkboxLabel}>Acepto términos y condiciones generales.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={handleSignUp}>
              <Text style={styles.registerButtonText}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomLinksContainer}>
            <TouchableOpacity style={styles.loginContainer} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>
                ¿Ya tienes una cuenta? <Text style={{ color: YELLOW, fontWeight: 'bold' }}>Ingresar</Text>
              </Text>
            </TouchableOpacity>
            <View style={styles.extraLinksContainer}>
                <TouchableOpacity><Text style={styles.extraLinkText}>Preguntas frecuentes</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.extraLinkText}>Terminos y condiciones</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

// --- Hoja de Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: MAROON },
  backgroundImage: { flex: 1 },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, height: '100%' },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  logo: { ...LOGO_STYLE, alignSelf: 'center', marginTop: 20 },
  contentBox: { width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, padding: 25, alignItems: 'center', marginTop: 20 },
  tabSwitch: { flexDirection: 'row', backgroundColor: DARK_GREY, borderRadius: 50, padding: 5, marginBottom: 25, width: '100%', position: 'relative', justifyContent: 'space-around', alignItems: 'center' },
  tabSlider: { position: 'absolute', width: '50%', height: '100%', backgroundColor: MAROON, borderRadius: 50, right: 5 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 16, zIndex: 1, flex: 1, textAlign: 'center' },
  tabTextInactive: { color: '#fff', fontWeight: 'normal', fontSize: 16, zIndex: 1 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: DARK_GREY, marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', height: 50, backgroundColor: '#F0F0F0', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  termsLegend: { fontSize: 12, color: DARK_GREY, textAlign: 'center', marginTop: 10, marginBottom: 15, },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, },
  checkboxLabel: { marginLeft: 10, fontSize: 14, color: DARK_GREY },
  registerButton: { width: '100%', backgroundColor: MAROON, padding: 15, borderRadius: 10, alignItems: 'center' },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bottomLinksContainer: { alignItems: 'center', width: '100%', paddingBottom: 10 },
  loginContainer: { paddingVertical: 15 },
  loginText: { color: '#fff', fontSize: 16 },
  extraLinksContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginTop: 0, paddingBottom: 10 },
  extraLinkText: { color: YELLOW, textDecorationLine: 'underline', fontSize: 14 },
});