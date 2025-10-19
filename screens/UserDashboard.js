/**
 * @file UserDashboard.js
 * @description Panel de control del usuario para gestionar su perfil, contraseña y preferencias.
 */

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
  Image,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../components/CustomAlert';
import { ThemeContext } from '../theme/ThemeContext';
import { cloudinaryConfig } from '../src/config/cloudinaryConfig';

/**
 * Componente principal del panel de usuario.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.navigation - Objeto de navegación de React Navigation.
 * @returns {JSX.Element}
 */
export default function UserDashboard({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { t } = useTranslation();

  // Estados del componente
  const [user, setUser] = useState(auth.currentUser);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [selectImageAlertVisible, setSelectImageAlertVisible] = useState(false);
  
  // Estados para la visibilidad de los modales
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Estados para el cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para la edición del perfil
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  
  // Estado para la subida de imagen
  const [uploading, setUploading] = useState(false);

  /**
   * Efecto para observar cambios en el estado de autenticación del usuario.
   */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const nameParts = currentUser.displayName?.split(' ') || ['', ''];
        setNombre(nameParts[0] || '');
        setApellido(nameParts.slice(1).join(' ') || '');
      }
    });
    return unsubscribe;
  }, []);

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
   * Cierra la sesión del usuario y navega a la pantalla de Login.
   */
  const handleLogOut = async () => {
    try {
      await signOut(auth);
      // El listener onAuthStateChanged en Navigation.js se encargará de la redirección.
    } catch (error) {
      console.error("Error during sign out: ", error);
      showAlert(t("logoutErrorTitle") || "Error", t("logoutError"));
    }
  };

  /**
   * Maneja el cambio de contraseña del usuario.
   * Requiere reautenticación.
   */
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showAlert(t("error"), t("passwordMismatch"));
      return;
    }
    if (!currentPassword || !newPassword) {
        showAlert(t("error"), t("fillAllFields"));
        return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
        showAlert(t("error"), "User not found.");
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        setPasswordModalVisible(false);
        // Limpiar campos
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showAlert(t("success"), t("passwordUpdated"));
    } catch (error) {
        showAlert(t("error"), t("wrongPassword"));
    }
  };

  /**
   * Actualiza el nombre y apellido del usuario.
   */
  const handleUpdateProfile = async () => {
    if (!nombre.trim() || !apellido.trim()) {
        showAlert(t("error"), t("nameAndSurnameRequired"));
        return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
        showAlert(t("error"), "User not found.");
        return;
    }

    try {
        const displayName = `${nombre.trim()} ${apellido.trim()}`;
        await updateProfile(currentUser, { displayName });
        setProfileModalVisible(false);        
        showAlert(t("success"), t("profileUpdated"));
    } catch (error) {
        showAlert(t("error"), t("profileUpdateFailed"));
    }
  };

  /**
   * Muestra un diálogo para que el usuario elija entre la cámara y la galería.
   */
  const selectImage = () => {
    console.log("selectImage: Mostrando opciones de selección de imagen.");
    setSelectImageAlertVisible(true);
  };

  const handleSelectImageOption = (action) => {
    setSelectImageAlertVisible(false);
    action();
  };

  /**
   * Abre la cámara para tomar una foto.
   */
  const takePhotoFromCamera = async () => {
    console.log("takePhotoFromCamera: Iniciando proceso de cámara.");
    try {
      console.log("takePhotoFromCamera: Solicitando permisos de cámara...");
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log("takePhotoFromCamera: Estado del permiso de cámara:", status);

      if (status !== 'granted') {
        showAlert(t('permissionDenied'), t('cameraPermissionDeniedMessage'));
        return;
      }

      console.log("takePhotoFromCamera: Permiso concedido. Abriendo cámara...");
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      console.log("takePhotoFromCamera: Resultado de la cámara:", result);

      if (!result.canceled) {
        console.log("takePhotoFromCamera: Foto tomada. Subiendo imagen:", result.assets[0].uri);
        uploadImage(result.assets[0].uri);
      } else {
        console.log("takePhotoFromCamera: El usuario canceló la cámara.");
      }
    } catch (error) {
      console.error("Error en takePhotoFromCamera:", error);
      showAlert('Error', 'Ocurrió un error al usar la cámara.');
    }
  };

  /**
   * Abre la galería para seleccionar una imagen.
   */
  const pickImageFromGallery = async () => {
    console.log("pickImageFromGallery: Iniciando proceso de galería.");
    try {
      console.log("pickImageFromGallery: Solicitando permisos de la galería...");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("pickImageFromGallery: Estado del permiso de la galería:", status);

      if (status !== 'granted') {
        showAlert(t('permissionDenied'), t('galleryPermissionDeniedMessage'));
        return;
      }

      console.log("pickImageFromGallery: Permiso concedido. Abriendo galería...");
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      console.log("pickImageFromGallery: Resultado de la galería:", result);

      if (!result.canceled) {
        console.log("pickImageFromGallery: Imagen seleccionada. Subiendo imagen:", result.assets[0].uri);
        uploadImage(result.assets[0].uri);
      } else {
        console.log("pickImageFromGallery: El usuario canceló la selección de la galería.");
      }
    } catch (error) {
      console.error("Error en pickImageFromGallery:", error);
      showAlert('Error', 'Ocurrió un error al seleccionar una imagen de la galería.');
    }
  };


  /**
   * Sube la imagen seleccionada a Cloudinary y actualiza el perfil del usuario.
   * @param {string} uri - La URI local de la imagen seleccionada.
   */
  const uploadImage = async (uri) => {
    setUploading(true);
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });
    formData.append('upload_preset', cloudinaryConfig.upload_preset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      const currentUser = auth.currentUser;

      if (data.secure_url && currentUser) {
        await updateProfile(currentUser, { photoURL: data.secure_url });
        setUser({ ...currentUser, photoURL: data.secure_url });
        showAlert(t('success'), t('profileUpdated'));
      } else {
        console.error("Cloudinary upload failed or user not found. Response:", data);
        throw new Error('Image upload failed. See console for details.');
      }
    } catch (error) {
      console.error(error);
      showAlert(t('error'), t('imageUploadError'));
    } finally {
      setUploading(false);
    }
  };

  const userEmail = user?.email || t('emailNotAvailable');
  const displayName = `${nombre} ${apellido}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Cabecera con información del usuario */}
        <View style={styles.header}>
          <TouchableOpacity onPress={selectImage} style={styles.profilePicContainer}>
            {uploading ? (
              <ActivityIndicator size="large" color={theme.card} />
            ) : user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profilePic} />
            ) : (
              <FontAwesome name="user-circle" size={100} color={theme.card} />
            )}
            <View style={styles.cameraIcon}>
                <FontAwesome name="camera" size={20} color={theme.primary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>
        </View>

        {/* Panel de opciones */}
        <View style={styles.optionsPanel}>
          <OptionButton
            icon="person-outline"
            text={t('editProfile')}
            onPress={() => setProfileModalVisible(true)}
            theme={theme}
          />
          <OptionButton
            icon="lock-closed-outline"
            text={t('changePassword')}
            onPress={() => setPasswordModalVisible(true)}
            theme={theme}
          />
          <OptionButton
            icon="settings-outline"
            text={t('appPreferences')}
            onPress={() => navigation.navigate('Preferences')}
            theme={theme}
          />
          <OptionButton
            icon="help-circle-outline"
            text={t('helpAndSupport')}
            onPress={() => navigation.navigate('Help')}
            theme={theme}
          />
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
          <Ionicons name="log-out-outline" size={24} color={theme.primary} />
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <CustomAlert
        visible={selectImageAlertVisible}
        title={t("selectImageTitle") || "Seleccionar Imagen"}
        message={t("selectImageMessage") || "Elige una opción para tu foto de perfil."}
        onClose={() => setSelectImageAlertVisible(false)}
        showIcon={false}
        buttonLayout='column'
        buttons={[
          {
            text: t("camera") || "Cámara",
            onPress: () => handleSelectImageOption(takePhotoFromCamera),
          },
          {
            text: t("gallery") || "Galería",
            onPress: () => handleSelectImageOption(pickImageFromGallery),
          },
        ]}
      />

      {/* Modal para editar perfil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('editProfileTitle')}</Text>
                <TextInput placeholder={t('name')} value={nombre} onChangeText={setNombre} style={styles.input} placeholderTextColor={theme.text}/>
                <TextInput placeholder={t('surname')} value={apellido} onChangeText={setApellido} style={styles.input} placeholderTextColor={theme.text}/>
                <View style={styles.modalButtons}>
                    <Button title={t('save')} onPress={handleUpdateProfile} color={theme.primary} />
                    <Button title={t('cancel')} onPress={() => setProfileModalVisible(false)} color="#888" />
                </View>
            </View>
        </View>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('changePasswordTitle')}</Text>
                <TextInput placeholder={t('currentPassword')} value={currentPassword} onChangeText={setCurrentPassword} style={styles.input} secureTextEntry placeholderTextColor={theme.text} />
                <TextInput placeholder={t('newPassword')} value={newPassword} onChangeText={setNewPassword} style={styles.input} secureTextEntry placeholderTextColor={theme.text}/>
                <TextInput placeholder={t('confirmNewPassword')} value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} secureTextEntry placeholderTextColor={theme.text}/>
                <View style={styles.modalButtons}>
                    <Button title={t('save')} onPress={handleChangePassword} color={theme.primary} />
                    <Button title={t('cancel')} onPress={() => setPasswordModalVisible(false)} color="#888" />
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/**
 * Componente para un botón de opción en el panel.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.icon - Nombre del icono de Ionicons.
 * @param {string} props.text - Texto del botón.
 * @param {function} props.onPress - Función a ejecutar al presionar.
 * @param {object} props.theme - Objeto de tema para estilos.
 * @returns {JSX.Element}
 */
const OptionButton = ({ icon, text, onPress, theme }) => {
    const styles = getStyles(theme);
    return (
      <TouchableOpacity style={styles.optionButton} onPress={onPress}>
        <Ionicons name={icon} size={26} color={theme.primary} />
        <Text style={styles.optionText}>{text}</Text>
        <FontAwesome name="angle-right" size={24} color={theme.text} style={{opacity: 0.6}}/>
      </TouchableOpacity>
    );
};

/**
 * Genera los estilos para el componente basados en el tema.
 * @param {object} theme - El objeto de tema.
 * @returns {object} - Objeto de estilos de StyleSheet.
 */
const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: theme.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profilePicContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    marginBottom: 15,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: theme.card,
    borderRadius: 15,
    padding: 8,
  },
  profileName: {
    fontFamily: 'Roboto-Bold',
    fontSize: 28,
    color: theme.card,
    textTransform: 'capitalize',
    marginTop: 10,
  },
  profileEmail: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: theme.card,
    opacity: 0.8,
  },
  optionsPanel: {
    margin: 20,
    backgroundColor: theme.card,
    borderRadius: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  optionText: {
    flex: 1,
    fontFamily: 'Roboto-Bold',
    fontSize: 17,
    color: theme.text,
    marginLeft: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
    borderRadius: 15,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  logoutButtonText: {
    color: theme.primary,
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.card,
    padding: 25,
    borderRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    marginBottom: 25,
    textAlign: 'center',
    color: theme.text,
  },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: theme.text,
    fontFamily: 'Roboto-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  }
});
