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
} from 'react-native';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../components/CustomAlert';
import { ThemeContext } from '../theme/ThemeContext';
import { cloudinaryConfig } from '../src/config/cloudinaryConfig';

export default function UserDashboard({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { t } = useTranslation();

  const [user, setUser] = useState(auth.currentUser);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  
  const [uploading, setUploading] = useState(false);

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
      showAlert(t("error"), t("logoutError"));
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showAlert(t("error"), t("passwordMismatch"));
      return;
    }
    if (!currentPassword || !newPassword) {
        showAlert(t("error"), t("fillAllFields"));
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
        showAlert(t("success"), t("passwordUpdated"));
    } catch (error) {
        showAlert(t("error"), t("wrongPassword"));
    }
  };

  const handleUpdateProfile = async () => {
    if (!nombre.trim() || !apellido.trim()) {
        showAlert(t("error"), t("nameAndSurnameRequired"));
        return;
    }
    try {
        const displayName = `${nombre.trim()} ${apellido.trim()}`;
        await updateProfile(user, { displayName });
        setProfileModalVisible(false);        
        showAlert(t("success"), t("profileUpdated"));
    } catch (error) {
        showAlert(t("error"), t("profileUpdateFailed"));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(t('permissionDenied'), t('permissionDeniedMessage'));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

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

      if (data.secure_url) {
        await updateProfile(user, { photoURL: data.secure_url });
        setUser({ ...user, photoURL: data.secure_url });
        showAlert(t('success'), t('profileUpdated'));
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.log(error);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
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

      {/* Modals remain the same for now, can be styled later */}
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
  // Modal styles can be improved here
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