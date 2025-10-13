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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../src/config/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../components/CustomAlert';
import { ThemeContext } from '../theme/ThemeContext';

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
  const [progress, setProgress] = useState(0);

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
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile-pictures/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      }, 
      (error) => {
        console.log(error);
        setUploading(false);
        showAlert(t('error'), t('imageUploadError'));
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateProfile(user, { photoURL: downloadURL });
          setUser({ ...user, photoURL: downloadURL });
          setUploading(false);
          showAlert(t('success'), t('profileUpdated'));
        });
      }
    );
  };

  const userEmail = user?.email || t('emailNotAvailable');
  const displayName = `${nombre} ${apellido}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('userProfile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
              </View>
            ) : user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profilePic} />
            ) : (
              <FontAwesome name="user-circle" size={80} color={theme.primary} />
            )}
            <View style={styles.cameraIcon}>
                <FontAwesome name="camera" size={20} color={theme.card} />
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
          <Ionicons name="log-out-outline" size={22} color={theme.card} />
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
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
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.border,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  progressText: {
    color: '#fff',
    marginTop: 5,
    fontFamily: 'Roboto-Bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: theme.card,
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
    marginTop: 20,
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