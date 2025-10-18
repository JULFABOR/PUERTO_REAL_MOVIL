import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  ImageBackground,
  Platform,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { db } from '../src/config/firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CustomAlert from '../components/CustomAlert';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../theme/ThemeContext';
import { getCrudStyles } from '../theme/crudStyles';

const BACKGROUND_IMAGE = require('../assets/wine-cellar-573833.jpg');

const ProveedorForm = ({ visible, onClose, onSave, proveedor, theme }) => {
  const { t } = useTranslation();
  const styles = getCrudStyles(theme);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (proveedor) {
      setName(proveedor.name || '');
      setContactPerson(proveedor.contactPerson || '');
      setPhone(proveedor.phone || '');
      setEmail(proveedor.email || '');
    } else {
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
    }
  }, [proveedor]);

  const handleSave = () => {
    onSave({ name, contactPerson, phone, email });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitleText}>{proveedor ? t('suppliers.editSupplier') : t('suppliers.addSupplier')}</Text>
                <TouchableOpacity onPress={onClose}><FontAwesome name="times-circle" size={30} color={theme.text} /></TouchableOpacity>
            </View>
            <ScrollView>
                <Text style={styles.formLabel}>{t('suppliers.companyName')}</Text>
                <TextInput style={styles.formInput} placeholder={t('suppliers.companyNamePlaceholder')} value={name} onChangeText={setName} placeholderTextColor={theme.text} />
                
                <Text style={styles.formLabel}>{t('suppliers.contactPerson')}</Text>
                <TextInput style={styles.formInput} placeholder={t('suppliers.contactPersonPlaceholder')} value={contactPerson} onChangeText={setContactPerson} placeholderTextColor={theme.text} />

                <Text style={styles.formLabel}>{t('suppliers.phone')}</Text>
                <TextInput style={styles.formInput} placeholder={t('suppliers.phonePlaceholder')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={theme.text} />

                <Text style={styles.formLabel}>{t('suppliers.email')}</Text>
                <TextInput style={styles.formInput} placeholder={t('suppliers.emailPlaceholder')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.text} />
            </ScrollView>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                <FontAwesome name={proveedor ? 'save' : 'plus'} size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>{proveedor ? t('suppliers.saveChanges') : t('suppliers.addSupplier')}</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function GestionProveedores({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const styles = getCrudStyles(theme);

  const [proveedores, setProveedores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingProveedor, setDeletingProveedor] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "proveedores"), (snapshot) => {
      const proveedoresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProveedores(proveedoresData);
    });
    return () => unsubscribe();
  }, []);

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleAdd = () => {
    setSelectedProveedor(null);
    setModalVisible(true);
  };

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setModalVisible(true);
  };

  const handleDelete = (proveedor) => {
    setDeletingProveedor(proveedor);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (deletingProveedor) {
      try {
        await deleteDoc(doc(db, "proveedores", deletingProveedor.id));
        setIsDeleteModalVisible(false);
        setDeletingProveedor(null);
        showAlert(t("suppliers.success"), t("suppliers.supplierDeleted"));
      } catch (error) {
        showAlert(t("error"), error.message);
      }
    }
  };

  const handleSave = async (data) => {
    if (!data.name || !data.contactPerson || !data.phone || !data.email) {
      showAlert(t("suppliers.error"), t("suppliers.allFieldsRequired"));
      return;
    }

    try {
      if (selectedProveedor) {
        const proveedorRef = doc(db, "proveedores", selectedProveedor.id);
        await updateDoc(proveedorRef, data);
        showAlert(t("suppliers.success"), t("suppliers.supplierUpdated"));
      } else {
        await addDoc(collection(db, "proveedores"), data);
        showAlert(t("suppliers.success"), t("suppliers.supplierAdded"));
      }
      setModalVisible(false);
      setSelectedProveedor(null);
    } catch (error) {
      showAlert(t("error"), error.message);
    }
  };

  const filteredProveedores = proveedores.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={28} color={theme.card} /></TouchableOpacity>
            <Text style={styles.headerTitle}>{t('suppliers.title')}</Text>
            <TouchableOpacity onPress={handleAdd}><Ionicons name="add" size={32} color={theme.card} /></TouchableOpacity>
          </View>
          <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={18} color={theme.text} style={styles.searchIcon} />
              <TextInput style={styles.searchInput} placeholder={t('suppliers.search')} placeholderTextColor={theme.text} value={searchQuery} onChangeText={setSearchQuery} />
            </View>
          </View>
          <FlatList 
            data={filteredProveedores} 
            renderItem={({item}) => <ProveedorItem item={item} onEdit={handleEdit} onDelete={handleDelete} theme={theme} />} 
            keyExtractor={item => item.id} 
            contentContainerStyle={styles.listContainer} 
          />
        </View>
      </ImageBackground>

      <ProveedorForm 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleSave} 
        proveedor={selectedProveedor} 
        theme={theme} 
      />

      <Modal visible={isDeleteModalVisible} onRequestClose={() => setIsDeleteModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>{t('suppliers.confirmDeletion')}</Text>
              <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)}><FontAwesome name="times-circle" size={30} color={theme.text} /></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.deleteIconContainer}><FontAwesome name="exclamation-triangle" size={50} color={theme.primary} /></View>
              <Text style={styles.deleteQuestion}>{t('suppliers.confirmDeleteMessage')}</Text>
              {deletingProveedor && <Text style={styles.deleteInfo}>{t('suppliers.supplierWillBeDeleted', {name: deletingProveedor.name})}</Text>}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsDeleteModalVisible(false)}><Text style={[styles.buttonText, {color: theme.text}]}>{t('suppliers.cancel')}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={confirmDelete}><Text style={styles.buttonText}>{t('suppliers.delete')}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const ProveedorItem = ({ item, onEdit, onDelete, theme }) => {
  const styles = getCrudStyles(theme);
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="user" /> {item.contactPerson}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="phone" /> {item.phone}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="envelope" /> {item.email}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}><FontAwesome name="pencil" size={20} color={theme.text} /></TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionButton}><FontAwesome name="trash" size={20} color={theme.primary} /></TouchableOpacity>
      </View>
    </View>
  );
};
