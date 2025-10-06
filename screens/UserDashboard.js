import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  Button,
  Alert,
  StatusBar,
} from 'react-native';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import { ThemeContext } from '../theme/ThemeContext';

export default function UserDashboard({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [user, setUser] = useState(auth.currentUser);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || 'Usuario');
    }
  }, [user]);

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      showAlert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las nuevas contraseñas no coinciden.");
      return;
    }
    if (!currentPassword || !newPassword) {
        Alert.alert("Error", "Por favor, rellena todos los campos.");
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert("Éxito", "Tu contraseña ha sido actualizada.");
    } catch (error) {
        showAlert("Error", "La contraseña actual es incorrecta o ha ocurrido un error.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
        Alert.alert("Error", "El nombre de usuario no puede estar vacío.");
        return;
    }
    try {
        await updateProfile(user, { displayName: displayName.trim() });
        setProfileModalVisible(false);
        Alert.alert("Éxito", "Tu nombre de usuario ha sido actualizado.");
    } catch (error) {
        showAlert("Error", "No se pudo actualizar el perfil.");
    }
  };

  const userEmail = user?.email || 'No disponible';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil de Usuario</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <View style={styles.profilePicContainer}>
            <FontAwesome name="user-circle" size={80} color={theme.primary} />
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>
        </View>

        <View style={styles.optionsPanel}>
          <OptionButton
            icon="person-outline"
            text="Editar Perfil"
            onPress={() => setProfileModalVisible(true)}
            theme={theme}
          />
          <OptionButton
            icon="lock-closed-outline"
            text="Cambiar Contraseña"
            onPress={() => setPasswordModalVisible(true)}
            theme={theme}
          />
          <OptionButton
            icon="settings-outline"
            text="Preferencias de la App"
            onPress={() => navigation.navigate('Preferences')}
            theme={theme}
          />
          <OptionButton
            icon="help-circle-outline"
            text="Ayuda y Soporte"
            onPress={() => navigation.navigate('Help')}
            theme={theme}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
          <Ionicons name="log-out-outline" size={22} color={theme.card} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
                <TextInput placeholder="Contraseña Actual" value={currentPassword} onChangeText={setCurrentPassword} style={styles.input} secureTextEntry placeholderTextColor={theme.text} />
                <TextInput placeholder="Nueva Contraseña" value={newPassword} onChangeText={setNewPassword} style={styles.input} secureTextEntry placeholderTextColor={theme.text}/>
                <TextInput placeholder="Confirmar Nueva Contraseña" value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} secureTextEntry placeholderTextColor={theme.text}/>
                <View style={styles.modalButtons}>
                    <Button title="Guardar Cambios" onPress={handleChangePassword} color={theme.primary} />
                    <Button title="Cancelar" onPress={() => setPasswordModalVisible(false)} color="#888" />
                </View>
            </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Editar Perfil</Text>
                <TextInput placeholder="Nombre de Usuario" value={displayName} onChangeText={setDisplayName} style={styles.input} placeholderTextColor={theme.text}/>
                <View style={styles.modalButtons}>
                    <Button title="Guardar" onPress={handleUpdateProfile} color={theme.primary} />
                    <Button title="Cancelar" onPress={() => setProfileModalVisible(false)} color="#888" />
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const OptionButton = ({ icon, text, onPress, theme }) => {
    const styles = getStyles(theme);
    return (
      <TouchableOpacity style={styles.optionButton} onPress={onPress}>
        <View style={styles.optionIconContainer}>
          <Ionicons name={icon} size={24} color={theme.primary} />
        </View>
        <Text style={styles.optionText}>{text}</Text>
        <FontAwesome name="angle-right" size={24} color={theme.text} />
      </TouchableOpacity>
    );
};

const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 26,
    color: theme.text,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: theme.card,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  profilePicContainer: {
    marginBottom: 15,
    borderWidth: 3,
    borderColor: theme.primary,
    borderRadius: 50,
    padding: 2
  },
  profileName: {
    fontFamily: 'Roboto-Bold',
    fontSize: 22,
    color: theme.text,
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: theme.text,
    opacity: 0.7,
  },
  optionsPanel: {
    backgroundColor: theme.card,
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  optionIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: theme.text,
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: theme.card,
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.card,
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: theme.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: theme.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  }
});